/**
 * GoalMills Social Engine — Structured Logger
 *
 * Lightweight logger with log levels, timestamps, and context.
 * Outputs JSON in production, pretty-prints in development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) || 'info'] ?? LOG_LEVELS.info;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [SOCIAL-ENGINE] [${level.toUpperCase()}]`;

  if (IS_PRODUCTION) {
    return JSON.stringify({
      timestamp,
      service: 'social-engine',
      level,
      message,
      ...(meta ? { meta: meta instanceof Error ? { message: meta.message, stack: meta.stack } : meta } : {}),
    });
  }

  const metaStr = meta
    ? meta instanceof Error
      ? ` | ${meta.message}`
      : ` | ${JSON.stringify(meta)}`
    : '';
  return `${prefix} ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: any): void {
  if (LOG_LEVELS[level] < MIN_LEVEL) return;

  const formatted = formatMessage(level, message, meta);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, meta?: any) => log('debug', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
};
