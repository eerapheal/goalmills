export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  service?: string;
  domain?: string;
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
