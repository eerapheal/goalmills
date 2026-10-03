import type { LogContext, LogLevel, StructuredLogEntry } from './types';

export class StructuredLogger {
  private serviceName: string;
  private defaultContext: LogContext;

  constructor(serviceName: string = 'goalmills-platform', defaultContext: LogContext = {}) {
    this.serviceName = serviceName;
    this.defaultContext = defaultContext;
  }

  withContext(context: LogContext): StructuredLogger {
    return new StructuredLogger(this.serviceName, {
      ...this.defaultContext,
      ...context,
    });
  }

  withCorrelationId(correlationId: string): StructuredLogger {
    return this.withContext({ correlationId });
  }

  private write(level: LogLevel, message: string, context?: LogContext, err?: Error): void {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      context: {
        ...this.defaultContext,
        ...context,
      },
    };

    if (err) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }

    const json = JSON.stringify(entry);
    if (level === 'error') {
      console.error(json);
    } else if (level === 'warn') {
      console.warn(json);
    } else {
      console.log(json);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, err?: Error, context?: LogContext): void {
    this.write('error', message, context, err);
  }
}

export const logger = new StructuredLogger('goalmills-core');
