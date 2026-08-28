import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { hasPermission, type PermissionAction } from '@/lib/rbac';
import type { UserRole } from '@goalmills/types';

/**
 * Server-side API route guard — verifies current session has the required permission.
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
