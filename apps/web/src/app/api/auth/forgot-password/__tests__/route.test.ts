import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const mockUser = {
  _id: 'user-forgot-1',
  email: 'test@goalmills.com',
  resetPasswordToken: null as string | null,
  resetPasswordExpires: null as Date | null,
  save: vi.fn().mockResolvedValue(true),
};

vi.mock('@/models/User', () => ({
  default: {
    findOne: vi.fn().mockImplementation(({ email }) => {
      if (email === 'test@goalmills.com') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
  },
}));

import { POST } from '../route';

describe('Forgot Password API (/api/auth/forgot-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate reset token for existing user', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@goalmills.com' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.resetToken).toBeDefined();
    expect(json.resetUrl).toContain('/reset-password?token=');
  });

  it('should return error if email is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
