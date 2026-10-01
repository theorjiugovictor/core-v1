import 'server-only';
import { NextResponse, after } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { db, Collections } from './firebase/config';
import type { User } from './types';
import { claimOnce, releaseClaim } from './redis';
import { telemetry } from './telemetry';
import { businessDateKey } from './time';

/**
 * Runs a per-user cron job in bounded batches so it keeps working as the
 * customer base grows.
 *
 * Each invocation:
 *   1. reads one page of users (PAGE_SIZE, ordered by document id, after `cursor`),
 *   2. processes them CONCURRENCY at a time,
 *   3. if there are more users, starts the next page as a *separate* function
 *      invocation (its own 60s budget) by calling itself with the new cursor.
 *
 * Every user's work is claimed in Redis first (job + Lagos date + user id), so a
 * duplicate cron trigger, a retried page, or an overlapping run never sends the
 * same email twice. If the work throws, the claim is released so a manual
 * re-run can pick that user up.
 */

const PAGE_SIZE = 100;
const CONCURRENCY = 10;
const CLAIM_TTL_SECONDS = 60 * 60 * 36; // outlives the day it belongs to
const MAX_CHAIN_HOPS = 1000;            // safety valve: 100k users per run

export type CronOutcome = 'sent' | 'skipped';

type CronJob = {
  /** Stable job name, used in dedupe keys and telemetry (e.g. "daily_nudge"). */
  name: string;
  /**
   * Dedupe period key. Defaults to the Lagos date, i.e. at most once per user
   * per day. Weekly jobs can pass something coarser.
   */
  periodKey?: (now: Date) => string;
  run: (user: User, now: Date) => Promise<CronOutcome>;
};

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET is not set; rejecting cron request.');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * Where to send the next page. *.vercel.app URLs sit behind Vercel deployment
 * protection, so in production use the project's production domain
 * (usecoreapp.com), which Vercel exposes as VERCEL_PROJECT_PRODUCTION_URL.
 */
function selfOrigin(requestUrl: URL): string {
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return requestUrl.origin;
}

async function getUserPage(cursor: string | null): Promise<User[]> {
  let query = db
    .collection(Collections.USERS)
    .orderBy(FieldPath.documentId())
    .limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const { password, ...user } = doc.data() as any;
    return { id: doc.id, ...user } as User;
  });
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export function createCronHandler(job: CronJob) {
  return async function GET(request: Request) {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const hop = Number(url.searchParams.get('hop') ?? '0');
    // Pin "now" for the whole chain so every page uses the same day/week window.
    const now = url.searchParams.get('at') ? new Date(url.searchParams.get('at')!) : new Date();
    const period = (job.periodKey ?? businessDateKey)(now);

    try {
      const users = await getUserPage(cursor);

      const outcomes = await mapWithConcurrency(users, CONCURRENCY, async (user) => {
        const claimKey = `cron:${job.name}:${period}:${user.id}`;
        if (!(await claimOnce(claimKey, CLAIM_TTL_SECONDS))) return 'duplicate' as const;
        try {
          return await job.run(user, now);
        } catch (err) {
          await releaseClaim(claimKey);
          console.error(`${job.name} failed for user ${user.id}:`, err);
          telemetry.error(`Cron ${job.name} failed for user`, user.id, {
            'event.name': `cron.${job.name}.user_failed`,
            'error.message': err instanceof Error ? err.message : String(err),
          });
          return 'failed' as const;
        }
      });

      const summary = { sent: 0, skipped: 0, duplicate: 0, failed: 0 };
      for (const o of outcomes) summary[o]++;

      // More users? Continue in a fresh invocation with its own time budget.
      const hasMore = users.length === PAGE_SIZE;
      if (hasMore && hop < MAX_CHAIN_HOPS) {
        const nextUrl = new URL(url.pathname, selfOrigin(url));
        nextUrl.searchParams.set('cursor', users[users.length - 1].id);
        nextUrl.searchParams.set('hop', String(hop + 1));
        nextUrl.searchParams.set('at', now.toISOString());
        after(async () => {
          // Wait only until the next invocation has accepted the request; it
          // keeps running on its own after this one finishes.
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);
          try {
            await fetch(nextUrl, {
              headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
              signal: controller.signal,
            });
          } catch (err) {
            if (!(err instanceof Error && err.name === 'AbortError')) {
              console.error(`${job.name}: failed to start next page`, err);
              telemetry.error(`Cron ${job.name} could not start next page`, undefined, {
                'event.name': `cron.${job.name}.chain_failed`,
                'error.message': err instanceof Error ? err.message : String(err),
              });
            }
          } finally {
            clearTimeout(timer);
          }
        });
      }

      return NextResponse.json({ ok: true, job: job.name, period, hop, users: users.length, hasMore, ...summary });
    } catch (error) {
      console.error(`Cron ${job.name} crashed:`, error);
      telemetry.error(`Cron job ${job.name} crashed`, undefined, {
        'event.name': `cron.${job.name}.crashed`,
        'error.message': error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}
