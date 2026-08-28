import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const { mockEmployee } = vi.hoisted(() => ({
  mockEmployee: {
    _id: 'emp-1',
    fullName: 'Ibeh Udochukwu Gift Temitope',
    email: 'giftibeh585@gmail.com',
    phone: '08134336192',
    address: 'No 35 church street, Jos, Plateau State',
    jobTitle: 'Sports Media & Social Media Content Officer',
    department: 'Editorial & Digital Media',
    status: 'training',
    currentSalary: 30000,
    startingSalary: 50000,
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockEmployee]),
    }),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'emp-new', ...data })),
  },
}));

vi.mock('@/models/TrainingProgress', () => ({
  default: {
    create: vi.fn().mockResolvedValue({ _id: 'tp-1', overallProgressPercent: 0 }),
  },
}));

import { GET, POST } from '../route';

describe('Admin Employees API (/api/admin/employees)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return employee list on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/employees?status=training');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].fullName).toBe('Ibeh Udochukwu Gift Temitope');
  });

  it('should validate required fields on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'John Doe' }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('required');
  });

  it('should create employee and training progress on valid POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'New Staff Member',
        email: 'staff@goalmills.com',
        phone: '08012345678',
        address: 'Lagos, Nigeria',
        jobTitle: 'Content Specialist',
        department: 'Editorial & Digital Media',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.fullName).toBe('New Staff Member');
  });
});
