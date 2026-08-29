import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

  // Redirect any legacy admin route requests to the dedicated admin app
  if (path === '/admin' || path.startsWith('/admin/')) {
    const targetPath = path.replace(/^\/admin/, '') || '/dashboard';
    return NextResponse.redirect(new URL(targetPath, adminUrl));
  }

  // Attach enterprise security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

