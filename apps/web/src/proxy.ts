import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

  // 1. Redirect any legacy admin route requests to the dedicated admin app
  if (path === '/admin' || path.startsWith('/admin/')) {
    const targetPath = path.replace(/^\/admin/, '') || '/dashboard';
    return NextResponse.redirect(new URL(targetPath, adminUrl));
  }

  const response = NextResponse.next();

  // 2. Multi-Tenant Context Resolution
  const host = req.headers.get('host') || '';
  const xTenantSlugHeader = req.headers.get('x-tenant-slug');

  let tenantSlug = 'goalmills';

  if (xTenantSlugHeader) {
    tenantSlug = xTenantSlugHeader.toLowerCase().trim();
  } else {
    // Extract subdomain if on goalmills.com or goalmills domain
    const cleanHost = host.split(':')[0].toLowerCase();

    // Check if localhost or default domain
    if (
      cleanHost.includes('goalmills.com') ||
      cleanHost.includes('vercel.app') ||
      cleanHost.includes('localhost') ||
      cleanHost.includes('127.0.0.1')
    ) {
      const parts = cleanHost.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin' && parts[0] !== 'api') {
        tenantSlug = parts[0];
      }
    } else {
      // Custom domain mapping fallback: pass host header for backend lookup
      response.headers.set('x-custom-domain', cleanHost);
    }
  }

  response.headers.set('x-tenant-slug', tenantSlug);

  // 3. Enterprise Security Headers
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, og-image.png, robots.txt, sitemap.xml
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|og-image.png|robots.txt|sitemap.xml).*)',
  ],
};
