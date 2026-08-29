import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { UserRole } from '@goalmills/types';

const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  contributor: 1,
  staff: 2,
  editor: 3,
  manager: 4,
  'super-admin': 5,
};

const ROUTE_MIN_ROLE: { pathPrefix: string; minRole: UserRole }[] = [
  // Super-admin only
  { pathPrefix: '/users', minRole: 'super-admin' },
  { pathPrefix: '/admin/users', minRole: 'super-admin' },
  { pathPrefix: '/api/admin/users', minRole: 'super-admin' },
  { pathPrefix: '/payroll', minRole: 'super-admin' },
  { pathPrefix: '/admin/payroll', minRole: 'super-admin' },
  { pathPrefix: '/api/admin/payroll', minRole: 'super-admin' },

  // Manager+
  { pathPrefix: '/employees', minRole: 'manager' },
  { pathPrefix: '/admin/employees', minRole: 'manager' },
  { pathPrefix: '/api/admin/employees', minRole: 'manager' },
  { pathPrefix: '/evaluations', minRole: 'manager' },
  { pathPrefix: '/admin/evaluations', minRole: 'manager' },
  { pathPrefix: '/api/admin/evaluations', minRole: 'manager' },

  // Editor+
  { pathPrefix: '/categories', minRole: 'editor' },
  { pathPrefix: '/admin/categories', minRole: 'editor' },
  { pathPrefix: '/api/admin/categories', minRole: 'editor' },

  // Staff+ (handbook, reports, standup, portal, dashboard)
  { pathPrefix: '/handbook', minRole: 'staff' },
  { pathPrefix: '/admin/handbook', minRole: 'staff' },
  { pathPrefix: '/reports', minRole: 'staff' },
  { pathPrefix: '/admin/reports', minRole: 'staff' },
  { pathPrefix: '/standup', minRole: 'staff' },
  { pathPrefix: '/admin/standup', minRole: 'staff' },
  { pathPrefix: '/portal', minRole: 'staff' },
  { pathPrefix: '/admin/portal', minRole: 'staff' },
  { pathPrefix: '/dashboard', minRole: 'staff' },
  { pathPrefix: '/admin/dashboard', minRole: 'staff' },
];

function meetsMinRole(currentRole: string | undefined, minRole: string): boolean {
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = (token?.role as string) || '';

    // Check route-specific permissions
    for (const route of ROUTE_MIN_ROLE) {
      if (path === route.pathPrefix || path.startsWith(route.pathPrefix + '/')) {
        if (!meetsMinRole(role, route.minRole)) {
          if (path.startsWith('/api/')) {
            return NextResponse.json(
              { message: 'Forbidden: Insufficient permissions' },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url));
        }
        break;
      }
    }

    // General protection — must have contributor role or higher
    if (!meetsMinRole(role, 'contributor')) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Unauthorized: Staff or Admin access required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/signin?error=AccessDenied', req.url));
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
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (
          path.startsWith('/signin') ||
          path.startsWith('/login') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/_next') ||
          path.includes('favicon')
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - signin, login
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|signin|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
