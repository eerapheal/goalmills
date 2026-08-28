import { UserRole } from '@goalmills/types';

export type PermissionAction =
  | 'articles:read'
  | 'articles:draft'
  | 'articles:publish'
  | 'articles:edit_any'
  | 'articles:delete'
  | 'categories:manage'
  | 'transfers:manage'
  | 'videos:upload'
  | 'users:manage'
  | 'system:settings';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  contributor: 1,
  staff: 2,
  'super-admin': 3,
};

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  user: ['articles:read'],
  contributor: ['articles:read', 'articles:draft'],
  staff: [
    'articles:read',
    'articles:draft',
    'articles:publish',
    'articles:edit_any',
    'categories:manage',
    'transfers:manage',
    'videos:upload',
  ],
  'super-admin': [
    'articles:read',
    'articles:draft',
    'articles:publish',
    'articles:edit_any',
    'articles:delete',
    'categories:manage',
    'transfers:manage',
    'videos:upload',
    'users:manage',
    'system:settings',
  ],
};

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
 * Check if a user's role meets the minimum required role level
 */
export function hasMinRole(currentRole: UserRole | undefined | null, minRole: UserRole): boolean {
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

/**
 * Determine if a user can edit a specific resource (Author of draft or staff+)
 */
export function canEditArticle(
  user: { id?: string; role?: UserRole } | null | undefined,
  articleAuthorId?: string
): boolean {
  if (!user || !user.role) return false;
  if (hasPermission(user.role, 'articles:edit_any')) return true;
  if (user.role === 'contributor' && articleAuthorId && user.id === articleAuthorId) return true;
  return false;
}
