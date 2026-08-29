import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS, sanitizeObject } from '@/lib/security';

/**
 * Enterprise Next.js API Proxy & Forwarder Gateway
 * Handles correlation IDs, header sanitization, timeout management,
 * and security payload validation for upstream/internal microservice requests.
 */

export interface ProxyOptions {
  targetUrl?: string;
  stripHeaders?: string[];
  addHeaders?: Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_STRIP_HEADERS = ['host', 'connection', 'content-length', 'transfer-encoding'];

/**
 * Securely forwards incoming NextRequest to a target service/endpoint
 */
export async function forwardProxyRequest(
  req: NextRequest,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const correlationId =
    req.headers.get('x-correlation-id') ||
    `gm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const target = options.targetUrl || req.nextUrl.toString();

  // Clone headers safely
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!DEFAULT_STRIP_HEADERS.includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  forwardHeaders.set('x-correlation-id', correlationId);
  forwardHeaders.set('x-forwarded-for', req.headers.get('x-forwarded-for') || '127.0.0.1');

  if (options.addHeaders) {
    Object.entries(options.addHeaders).forEach(([k, v]) => forwardHeaders.set(k, v));
  }

  try {
    let body: BodyInit | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const rawText = await req.text();
      try {
        const parsed = JSON.parse(rawText);
        const sanitized = sanitizeObject(parsed);
        body = JSON.stringify(sanitized);
      } catch {
        body = rawText;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

    const upstreamResponse = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseHeaders = new Headers(upstreamResponse.headers);
    Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
      responseHeaders.set(key, val);
    });
    responseHeaders.set('x-correlation-id', correlationId);

    const responseBody = await upstreamResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[Proxy Error] Correlation ID: ${correlationId}:`, error);

    const errorResponse = NextResponse.json(
      {
        success: false,
        error: 'Proxy Gateway Error: Unable to complete upstream request',
        correlationId,
      },
      { status: 502 }
    );

    Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
      errorResponse.headers.set(key, val);
    });

    return errorResponse;
  }
}
