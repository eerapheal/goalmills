import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'admin-super',
      name: 'Super Admin',
      email: 'admin@goalmills.com',
      role: 'super-admin',
    },
  }),
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockUser, mockEmployee } = vi.hoisted(() => ({
  mockUser: {
    _id: 'user-delete-me',
    username: 'Test Staff',
    email: 'staff@goalmills.com',
    role: 'staff',
  },
  mockEmployee: {
    _id: 'emp-delete-me',
    fullName: 'Test Staff',
    email: 'staff@goalmills.com',
    userId: 'user-delete-me',
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn().mockResolvedValue(mockUser),
    findByIdAndDelete: vi.fn().mockResolvedValue(mockUser),
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    find: vi.fn().mockResolvedValue([mockEmployee]),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('@/models/DailyReport', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('@/models/PerformanceEvaluation', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('@/models/Payroll', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('@/models/TrainingProgress', () => ({
  default: {
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('@/models/Standup', () => ({
  default: {
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

import { DELETE } from '../route';

describe('Admin User [id] API (/api/admin/users/[id])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent self-deletion', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/users/admin-super', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'admin-super' }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.message).toContain('cannot delete your own account');
  });

  it('should cascade delete user and all associated staff/employee documents', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/users/user-delete-me', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'user-delete-me' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toContain('deleted completely from DB');
  });
});
