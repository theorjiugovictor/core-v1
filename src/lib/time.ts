// Business-day time helpers.
//
// CORE's customers are Nigerian SMEs, so "today", "this week" and "this month"
// mean Lagos time (WAT, UTC+1, no daylight saving), not the UTC clock of the
// server the function happens to run on. All helpers return real instants
// (Date objects) so they can be compared with stored ISO timestamps or turned
// into Firestore range queries with toISOString().

export const BUSINESS_TIMEZONE = 'Africa/Lagos';
const BUSINESS_UTC_OFFSET_MS = 60 * 60 * 1000; // WAT is fixed at UTC+1

export type Period = 'today' | 'week' | 'month' | 'all';

/** Shift an instant into "Lagos wall-clock as if it were UTC" for calendar math. */
function toLocal(d: Date): Date {
  return new Date(d.getTime() + BUSINESS_UTC_OFFSET_MS);
}

/** Convert a Lagos wall-clock date (expressed in UTC fields) back to a real instant. */
function fromLocal(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m, day) - BUSINESS_UTC_OFFSET_MS);
}

/** Start of the Lagos calendar day containing `d`, shifted by `offsetDays`. */
export function startOfBusinessDay(d: Date = new Date(), offsetDays = 0): Date {
  const l = toLocal(d);
  return fromLocal(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + offsetDays);
}

/** Start of the Lagos calendar month containing `d`, shifted by `offsetMonths`. */
export function startOfBusinessMonth(d: Date = new Date(), offsetMonths = 0): Date {
  const l = toLocal(d);
  return fromLocal(l.getUTCFullYear(), l.getUTCMonth() + offsetMonths, 1);
}

/** Lagos calendar key (YYYY-MM-DD) for an instant. Handy for dedupe keys and grouping. */
export function businessDateKey(d: Date = new Date()): string {
  return toLocal(d).toISOString().slice(0, 10);
}

/** Lagos calendar month and year for an instant. */
export function businessMonth(d: Date): { year: number; monthIndex: number } {
  const l = toLocal(d);
  return { year: l.getUTCFullYear(), monthIndex: l.getUTCMonth() };
}

/**
 * Start instant for a reporting period, in Lagos time.
 * - today: since Lagos midnight
 * - week:  the last 7 Lagos days including today
 * - month: since the 1st of the current Lagos month
 * - all:   null (no lower bound)
 */
export function periodStart(period: Period, now: Date = new Date()): Date | null {
  switch (period) {
    case 'today': return startOfBusinessDay(now);
    case 'week': return startOfBusinessDay(now, -6);
    case 'month': return startOfBusinessMonth(now);
    default: return null;
  }
}

/**
 * Parse a stored date string. Full ISO timestamps are real instants. Legacy
 * date-only values ("YYYY-MM-DD") are treated as Lagos midnight of that day.
 */
export function parseNormalizedDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return fromLocal(y, m - 1, d);
  }
  return new Date(dateStr);
}
