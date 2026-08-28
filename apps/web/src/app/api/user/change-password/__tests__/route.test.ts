import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'user@goalmills.com',
      role: 'staff',
    },
  }),
}));

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockImplementation((pwd: string, hash: string) => Promise.resolve(pwd === 'correctPassword')),
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}));

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    _id: 'user-123',
    password: 'correctPassword_hash',
    save: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn().mockResolvedValue(mockUser),
  },
}));

import { POST } from '../route';

describe('User Change Password API (/api/user/change-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject if current password does not match', async () => {
    const req = new NextRequest('http://localhost:3000/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'wrongPassword',
        newPassword: 'newSecret123',
        confirmPassword: 'newSecret123',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain('Incorrect current password');
  });

  it('should change password successfully with valid credentials', async () => {
    const req = new NextRequest('http://localhost:3000/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: 'correctPassword',
        newPassword: 'newSecret123',
        confirmPassword: 'newSecret123',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('changed successfully');
  });
});
