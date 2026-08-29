import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}));

const mockUser = {
  _id: 'user-reset-1',
  email: 'test@goalmills.com',
  password: 'old_hashed_password',
  resetPasswordToken: 'valid-token',
  resetPasswordExpires: new Date(Date.now() + 3600000),
  save: vi.fn().mockResolvedValue(true),
};

vi.mock('@/models/User', () => ({
  default: {
    findOne: vi.fn().mockImplementation((query) => {
      if (query.resetPasswordToken === 'valid-token') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
  },
}));

import { POST } from '../route';

describe('Reset Password API (/api/auth/reset-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject invalid or expired token', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'invalid-token',
        newPassword: 'newSecretPassword1',
        confirmPassword: 'newSecretPassword1',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain('invalid or has expired');
  });

  it('should reset password successfully with valid token', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        newPassword: 'newSecretPassword1',
        confirmPassword: 'newSecretPassword1',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('reset successfully');
  });
});
