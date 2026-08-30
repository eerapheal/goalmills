import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const host = request.headers.get('host') || '';
  const xTenantSlugHeader = request.headers.get('x-tenant-slug');

  let tenantSlug = 'goalmills';

  if (xTenantSlugHeader) {
    tenantSlug = xTenantSlugHeader.toLowerCase();
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
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, og-image.png, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|robots.txt|sitemap.xml).*)',
  ],
};
