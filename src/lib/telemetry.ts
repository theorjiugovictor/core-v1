/**
 * Lightweight OTLP/HTTP log emitter for RootOps.
 *
 * Sends structured logs to the RootOps API at POST /v1/logs in the
 * OpenTelemetry OTLP/HTTP JSON format. Fire-and-forget — never blocks
 * the calling code, never throws.
 *
 * Set ROOTOPS_OTLP_URL to your RootOps API base URL:
 *   e.g. https://api.rootops.yourdomain.com
 *       or http://<alb-dns-name>
 *
 * RootOps will then index logs alongside your codebase and enable
 * semantic search, auto-heal, and incident analysis on CORE events.
 */

const SERVICE_NAME = 'core-app';
const SCOPE_NAME   = 'core-logger';

type Severity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

const SEVERITY_NUMBER: Record<Severity, number> = {
  DEBUG: 5,
  INFO:  9,
  WARN:  13,
  ERROR: 17,
  FATAL: 21,
};

type LogAttributes = Record<string, string | number | boolean | undefined>;

function toOtlpValue(v: string | number | boolean | undefined) {
  if (typeof v === 'string')  return { stringValue: v };
  if (typeof v === 'number')  return Number.isInteger(v) ? { intValue: v } : { doubleValue: v };
  if (typeof v === 'boolean') return { boolValue: v };
  return { stringValue: String(v) };
}

function buildPayload(body: string, severity: Severity, attrs: LogAttributes) {
  const attributes = Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({ key, value: toOtlpValue(value) }));

  return {
    resourceLogs: [{
      resource: {
        attributes: [
          { key: 'service.name', value: { stringValue: SERVICE_NAME } },
          { key: 'deployment.environment', value: { stringValue: process.env.NODE_ENV || 'production' } },
        ],
      },
      scopeLogs: [{
        scope: { name: SCOPE_NAME },
        logRecords: [{
          timeUnixNano: String(Date.now() * 1_000_000),
          severityNumber: SEVERITY_NUMBER[severity],
          severityText: severity,
          body: { stringValue: body },
          attributes,
        }],
      }],
    }],
  };
}

function emit(body: string, severity: Severity, attrs: LogAttributes = {}) {
  const url = process.env.ROOTOPS_OTLP_URL;
  if (!url) return; // silently skip if not configured

  const payload = buildPayload(body, severity, attrs);

  // Fire-and-forget — never await, never throw
  fetch(`${url}/v1/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Swallow — telemetry must never break the app
  });
}

// ─── Public API ───────────────────────────────────────────────────

export const telemetry = {
  /** AI command was processed (SALE, EXPENSE, CHAT, etc.) */
  aiCommand(userId: string, input: string, action: string, success: boolean, durationMs?: number) {
    emit(
      `AI command: ${action} — ${success ? 'ok' : 'failed'}`,
      success ? 'INFO' : 'WARN',
      {
        'event.name':    'ai.command',
        'user.id':        userId,
        'ai.action':      action,
        'ai.input':       input.slice(0, 200),
        'ai.success':     success,
        'duration.ms':    durationMs,
      },
    );
  },

  /** Auth event: login success/failure, register, logout */
  auth(event: 'login.success' | 'login.failed' | 'register' | 'logout', ip: string, userId?: string) {
    emit(
      `Auth: ${event}`,
      event === 'login.failed' ? 'WARN' : 'INFO',
      {
        'event.name': `auth.${event}`,
        'user.id':    userId,
        'http.client_ip': ip,
      },
    );
  },

  /** Rate limit hit */
  rateLimitHit(userId: string, endpoint: 'ai' | 'auth') {
    emit(
      `Rate limit hit on ${endpoint}`,
      'WARN',
      {
        'event.name': 'rate_limit.hit',
        'user.id':    userId,
        'endpoint':   endpoint,
      },
    );
  },

  /** Unhandled error in a server action */
  error(message: string, userId?: string, context?: LogAttributes) {
    emit(
      message,
      'ERROR',
      {
        'event.name': 'error',
        'user.id':    userId,
        ...context,
      },
    );
  },
};
