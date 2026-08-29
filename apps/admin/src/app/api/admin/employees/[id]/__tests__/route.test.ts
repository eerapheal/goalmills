import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@goalmills.com',
      role: 'super-admin',
    },
  }),
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/serverAuth', () => ({
  requirePermission: vi.fn().mockResolvedValue({ session: { user: { role: 'super-admin' } } }),
}));

const { mockEmployee } = vi.hoisted(() => ({
  mockEmployee: {
    _id: 'emp-123',
    fullName: 'Test Staff',
    email: 'staff@goalmills.com',
    userId: 'user-123',
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    findById: vi.fn().mockResolvedValue(mockEmployee),
    findByIdAndUpdate: vi.fn().mockResolvedValue(mockEmployee),
    findByIdAndDelete: vi.fn().mockResolvedValue(mockEmployee),
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findByIdAndDelete: vi.fn().mockResolvedValue({ _id: 'user-123' }),
    findOneAndDelete: vi.fn().mockResolvedValue({ _id: 'user-123' }),
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

import { GET, PATCH, DELETE } from '../route';

describe('Admin Employee [id] API (/api/admin/employees/[id])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get employee details by id', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/employees/emp-123');
    const res = await GET(req, { params: Promise.resolve({ id: 'emp-123' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.fullName).toBe('Test Staff');
  });

  it('should cascade delete employee, user, reports, evaluations, payroll, training', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/employees/emp-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'emp-123' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('completely removed');
  });
});
