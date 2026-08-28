import { UserRole } from '@goalmills/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Permission Actions — every gated action in the system
// ---------------------------------------------------------------------------
export type PermissionAction =
  // Editorial / Content
  | 'articles:read'
  | 'articles:draft'
  | 'articles:request_publish'
  | 'articles:publish'
  | 'articles:edit_own'
  | 'articles:edit_any'
  | 'articles:delete'
  | 'articles:approve'
  // Categories & Videos
  | 'categories:manage'
  | 'transfers:manage'
  | 'videos:upload'
  // Handbook
  | 'handbook:read'
  | 'handbook:manage'
  // Employees
  | 'employees:read'
  | 'employees:manage'
  | 'employees:onboard'
  // Reports
  | 'reports:read_own'
  | 'reports:read_all'
  | 'reports:submit'
  // Stand-ups
  | 'standup:attend'
  | 'standup:view_own'
  | 'standup:view_all'
  | 'standup:schedule'
  // Evaluations
  | 'evaluations:read'
  | 'evaluations:manage'
  // Payroll
  | 'payroll:read'
  | 'payroll:manage'
  // System
  | 'users:manage'
  | 'system:settings';

// ---------------------------------------------------------------------------
// Role Hierarchy — numeric level for quick min-role checks
// ---------------------------------------------------------------------------
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  contributor: 1,
  staff: 2,
  editor: 3,
  manager: 4,
  'super-admin': 5,
};

// ---------------------------------------------------------------------------
// Role ➜ Permissions map
// ---------------------------------------------------------------------------
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  // Public reader — no admin access
  user: ['articles:read'],

  // External freelancer — can draft and request approval only
  contributor: [
    'articles:read',
    'articles:draft',
    'articles:request_publish',
    'articles:edit_own',
  ],

  // Full-time editorial staff — content creation, own reports, training, portal
  staff: [
    'articles:read',
    'articles:draft',
    'articles:request_publish',
    'articles:edit_own',
    'videos:upload',
    'handbook:read',
    'reports:read_own',
    'reports:submit',
    'standup:attend',
    'standup:view_own',
  ],

  // Senior editorial staff — can publish, manage categories, schedule standups
  editor: [
    'articles:read',
    'articles:draft',
    'articles:request_publish',
    'articles:publish',
    'articles:approve',
    'articles:edit_own',
    'articles:edit_any',
    'categories:manage',
    'transfers:manage',
    'videos:upload',
    'handbook:read',
    'handbook:manage',
    'reports:read_own',
    'reports:submit',
    'standup:attend',
    'standup:view_own',
    'standup:view_all',
    'standup:schedule',
  ],

  // Department head — employee management, evaluations, onboarding
  manager: [
    'articles:read',
    'articles:draft',
    'articles:request_publish',
    'articles:publish',
    'articles:approve',
    'articles:edit_own',
    'articles:edit_any',
    'articles:delete',
    'categories:manage',
    'transfers:manage',
    'videos:upload',
    'handbook:read',
    'handbook:manage',
    'employees:read',
    'employees:manage',
    'employees:onboard',
    'reports:read_own',
    'reports:read_all',
    'reports:submit',
    'standup:attend',
    'standup:view_own',
    'standup:view_all',
    'standup:schedule',
    'evaluations:read',
    'evaluations:manage',
  ],

  // MD / Owner — full access
  'super-admin': [
    'articles:read',
    'articles:draft',
    'articles:request_publish',
    'articles:publish',
    'articles:approve',
    'articles:edit_own',
    'articles:edit_any',
    'articles:delete',
    'categories:manage',
    'transfers:manage',
    'videos:upload',
    'handbook:read',
    'handbook:manage',
    'employees:read',
    'employees:manage',
    'employees:onboard',
    'reports:read_own',
    'reports:read_all',
    'reports:submit',
    'standup:attend',
    'standup:view_own',
    'standup:view_all',
    'standup:schedule',
    'evaluations:read',
    'evaluations:manage',
    'payroll:read',
    'payroll:manage',
    'users:manage',
    'system:settings',
  ],
};

// ---------------------------------------------------------------------------
// Core permission check
// ---------------------------------------------------------------------------
/**
 * Check if a given role has permission to execute an action (Single Responsibility Principle)
 */
export function hasPermission(
  role: UserRole | undefined | null,
  action: PermissionAction
): boolean {
  if (!role) return action === 'articles:read';
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(action);
}

/**
 * Check if a role has ANY of the given permissions
 */
export function hasAnyPermission(
  role: UserRole | undefined | null,
  actions: PermissionAction[]
): boolean {
  return actions.some((action) => hasPermission(role, action));
}

/**
 * Check if a user's role meets the minimum required role level
 */
export function hasMinRole(currentRole: UserRole | undefined | null, minRole: UserRole): boolean {
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

// ---------------------------------------------------------------------------
// Article / content helpers
// ---------------------------------------------------------------------------
/**
 * Determine if a user can edit a specific resource (Author of draft or editor+)
 */
export function canEditArticle(
  user: { id?: string; role?: UserRole } | null | undefined,
  articleAuthorId?: string
): boolean {
  if (!user || !user.role) return false;
  if (hasPermission(user.role, 'articles:edit_any')) return true;
  if (
    hasPermission(user.role, 'articles:edit_own') &&
    articleAuthorId &&
    user.id === articleAuthorId
  )
    return true;
  return false;
}

/**
 * Check if a user can directly publish or must request approval.
 * Contributors & staff must request approval. Editors+ can publish directly.
 */
export function canDirectPublish(role: UserRole | undefined | null): boolean {
  return hasPermission(role, 'articles:publish');
}

// ---------------------------------------------------------------------------
// Navigation visibility — controls what nav items each role sees
// ---------------------------------------------------------------------------
export interface NavPermissionConfig {
  label: string;
  href: string;
  requiredPermission: PermissionAction;
}

export const NAV_PERMISSION_MAP: NavPermissionConfig[] = [
  { label: 'News & Media', href: '/admin/dashboard', requiredPermission: 'articles:draft' },
  { label: 'Handbook & SOPs', href: '/admin/handbook', requiredPermission: 'handbook:read' },
  { label: 'Employees & Staff', href: '/admin/employees', requiredPermission: 'employees:read' },
  { label: 'Daily Reports', href: '/admin/reports', requiredPermission: 'reports:read_own' },
  { label: '5 PM Stand-up', href: '/admin/standup', requiredPermission: 'standup:attend' },
  { label: 'Evaluations', href: '/admin/evaluations', requiredPermission: 'evaluations:read' },
  { label: 'Payroll & Allowances', href: '/admin/payroll', requiredPermission: 'payroll:read' },
  { label: 'Staff Portal', href: '/admin/portal', requiredPermission: 'articles:read' },
];

/**
 * Get the list of nav hrefs a role is allowed to see
 */
export function getVisibleNavHrefs(role: UserRole | undefined | null): string[] {
  return NAV_PERMISSION_MAP.filter((nav) => hasPermission(role, nav.requiredPermission)).map(
    (nav) => nav.href
  );
}

/**
 * Check if a role can access a given admin path
 */
export function canAccessPath(role: UserRole | undefined | null, pathname: string): boolean {
  const match = NAV_PERMISSION_MAP.find(
    (nav) => pathname === nav.href || pathname.startsWith(nav.href + '/')
  );
  if (!match) return true; // Unregistered paths are allowed by default (handled by middleware separately)
  return hasPermission(role, match.requiredPermission);
}

// ---------------------------------------------------------------------------
// API route guard — reusable server-side session + permission check
// ---------------------------------------------------------------------------
/**
 * Verify the current session has the required permission.
 * Returns `{ session, error }` — if `error` is set, return it immediately from the route.
 */
export async function requirePermission(requiredAction: PermissionAction) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json(
        { message: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  const role = session.user.role as UserRole | undefined;

  if (!hasPermission(role, requiredAction)) {
    return {
      session,
      error: NextResponse.json(
        {
          message: `Forbidden: Insufficient permissions. Required: ${requiredAction}`,
          requiredRole: requiredAction,
          currentRole: role,
        },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

// ---------------------------------------------------------------------------
// Route ➜ Permission mapping for middleware
// ---------------------------------------------------------------------------
export const ROUTE_PERMISSION_MAP: { pathPrefix: string; permission: PermissionAction }[] = [
  { pathPrefix: '/admin/users', permission: 'users:manage' },
  { pathPrefix: '/api/admin/users', permission: 'users:manage' },
  { pathPrefix: '/admin/employees', permission: 'employees:read' },
  { pathPrefix: '/api/admin/employees', permission: 'employees:read' },
  { pathPrefix: '/admin/payroll', permission: 'payroll:read' },
  { pathPrefix: '/api/admin/payroll', permission: 'payroll:read' },
  { pathPrefix: '/admin/evaluations', permission: 'evaluations:read' },
  { pathPrefix: '/api/admin/evaluations', permission: 'evaluations:read' },
  { pathPrefix: '/admin/standup', permission: 'standup:attend' },
  { pathPrefix: '/api/admin/standup', permission: 'standup:attend' },
  { pathPrefix: '/admin/reports', permission: 'reports:read_own' },
  { pathPrefix: '/api/admin/reports', permission: 'reports:read_own' },
  { pathPrefix: '/admin/categories', permission: 'categories:manage' },
  { pathPrefix: '/api/admin/categories', permission: 'categories:manage' },
  { pathPrefix: '/admin/handbook', permission: 'handbook:read' },
  { pathPrefix: '/api/admin/handbook', permission: 'handbook:read' },
];
