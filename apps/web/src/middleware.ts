import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { UserRole } from '@goalmills/types';

/**
 * Route ➜ Permission mapping for middleware.
 * Duplicated from rbac.ts because Edge Runtime cannot import Node.js modules
 * (getServerSession, mongoose, etc.) that rbac.ts now depends on.
 * Keep this in sync with ROUTE_PERMISSION_MAP in lib/rbac.ts.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  contributor: 1,
  staff: 2,
  editor: 3,
  manager: 4,
  'super-admin': 5,
};

/**
 * Maps each protected path prefix to the minimum role required.
 * Ordered from most-specific to least-specific so the first match wins.
 */
const ROUTE_MIN_ROLE: { pathPrefix: string; minRole: UserRole }[] = [
  // Super-admin only
  { pathPrefix: '/admin/users', minRole: 'super-admin' },
  { pathPrefix: '/api/admin/users', minRole: 'super-admin' },
  { pathPrefix: '/admin/payroll', minRole: 'super-admin' },
  { pathPrefix: '/api/admin/payroll', minRole: 'super-admin' },

  // Manager+
  { pathPrefix: '/admin/employees', minRole: 'manager' },
  { pathPrefix: '/api/admin/employees', minRole: 'manager' },
  { pathPrefix: '/admin/evaluations', minRole: 'manager' },
  { pathPrefix: '/api/admin/evaluations', minRole: 'manager' },

  // Editor+
  { pathPrefix: '/admin/categories', minRole: 'editor' },
  { pathPrefix: '/api/admin/categories', minRole: 'editor' },

  // Staff+ (handbook, reports, standup, portal, dashboard)
  { pathPrefix: '/admin/handbook', minRole: 'staff' },
  { pathPrefix: '/api/admin/handbook', minRole: 'staff' },
  { pathPrefix: '/admin/reports', minRole: 'staff' },
  { pathPrefix: '/api/admin/reports', minRole: 'staff' },
  { pathPrefix: '/admin/standup', minRole: 'staff' },
  { pathPrefix: '/api/admin/standup', minRole: 'staff' },
  { pathPrefix: '/admin/portal', minRole: 'staff' },
  { pathPrefix: '/admin/dashboard', minRole: 'staff' },
];

function meetsMinRole(currentRole: string | undefined, minRole: string): boolean {
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = (token?.role as string) || '';

    // Check route-specific permission
    for (const route of ROUTE_MIN_ROLE) {
      if (path.startsWith(route.pathPrefix)) {
        if (!meetsMinRole(role, route.minRole)) {
          // API routes return 403 JSON
          if (path.startsWith('/api/')) {
            return NextResponse.json(
              { message: 'Forbidden: Insufficient permissions' },
              { status: 403 }
            );
          }
          // Page routes redirect to dashboard
          return NextResponse.redirect(new URL('/admin/dashboard?error=forbidden', req.url));
        }
        break; // First match wins
      }
    }

    // General admin protection — at minimum need staff role
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (!meetsMinRole(role, 'staff')) {
        if (path.startsWith('/api/')) {
          return NextResponse.json(
            { message: 'Unauthorized: Admin access required' },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
