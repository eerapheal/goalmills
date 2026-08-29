import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('mock_hashed_password'),
  },
}));

vi.mock('@/models/User', () => {
  return {
    default: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
  };
});

import User from '@/models/User';
import { POST } from '../route';

describe('Auth Register API (/api/auth/register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain('required');
  });

  it('should return 400 if user already exists', async () => {
    (User.findOne as any).mockResolvedValue({ _id: 'existing_user_id' });

    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'existinguser',
        email: 'exists@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain('already exists');
  });

  it('should successfully register a new user', async () => {
    (User.findOne as any).mockResolvedValue(null);
    (User.create as any).mockResolvedValue({
      _id: 'new_user_id',
      username: 'newuser',
      email: 'new@example.com',
    });

    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.message).toContain('successfully');
  });
});
