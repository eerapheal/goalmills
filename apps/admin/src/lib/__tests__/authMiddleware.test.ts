import { describe, it, expect } from 'vitest';
import { ROLE_HIERARCHY, hasPermission, hasMinRole, canAccessPath } from '../rbac';

describe('RBAC & Auth Middleware Access Control', () => {
  it('should enforce proper role hierarchy levels', () => {
    expect(ROLE_HIERARCHY['user']).toBe(0);
    expect(ROLE_HIERARCHY['contributor']).toBe(1);
    expect(ROLE_HIERARCHY['staff']).toBe(2);
    expect(ROLE_HIERARCHY['editor']).toBe(3);
    expect(ROLE_HIERARCHY['manager']).toBe(4);
    expect(ROLE_HIERARCHY['super-admin']).toBe(5);

    expect(hasMinRole('staff', 'contributor')).toBe(true);
    expect(hasMinRole('editor', 'staff')).toBe(true);
    expect(hasMinRole('user', 'staff')).toBe(false);
  });

  it('should grant and restrict specific admin permissions by role', () => {
    // User cannot draft or manage
    expect(hasPermission('user', 'articles:draft')).toBe(false);
    expect(hasPermission('user', 'articles:read')).toBe(true);

    // Contributor can draft own articles
    expect(hasPermission('contributor', 'articles:draft')).toBe(true);
    expect(hasPermission('contributor', 'articles:publish')).toBe(false);

    // Staff can access handbook and submit reports
    expect(hasPermission('staff', 'handbook:read')).toBe(true);
    expect(hasPermission('staff', 'reports:submit')).toBe(true);
    expect(hasPermission('staff', 'employees:manage')).toBe(false);

    // Editor can publish and manage categories
    expect(hasPermission('editor', 'articles:publish')).toBe(true);
    expect(hasPermission('editor', 'categories:manage')).toBe(true);
    expect(hasPermission('editor', 'payroll:manage')).toBe(false);

    // Manager can manage employees and evaluations
    expect(hasPermission('manager', 'employees:manage')).toBe(true);
    expect(hasPermission('manager', 'evaluations:manage')).toBe(true);
    expect(hasPermission('manager', 'payroll:read')).toBe(false);

    // Super-admin has full unrestricted system access
    expect(hasPermission('super-admin', 'payroll:manage')).toBe(true);
    expect(hasPermission('super-admin', 'users:manage')).toBe(true);
    expect(hasPermission('super-admin', 'system:settings')).toBe(true);
  });

  it('should validate path accessibility based on user role', () => {
    expect(canAccessPath('staff', '/admin/dashboard')).toBe(true);
    expect(canAccessPath('staff', '/admin/handbook')).toBe(true);
    expect(canAccessPath('staff', '/admin/employees')).toBe(false);
    expect(canAccessPath('manager', '/admin/employees')).toBe(true);
    expect(canAccessPath('super-admin', '/admin/payroll')).toBe(true);
  });
});
