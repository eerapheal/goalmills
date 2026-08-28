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


const { mockStandup } = vi.hoisted(() => ({
  mockStandup: {
    _id: 'standup-1',
    meetingDate: '2026-09-01',
    time: '5:00 PM – 5:30 PM WAT',
    meetUrl: 'https://meet.google.com/goalmills-newsroom',
    hostName: 'Ekpenisi Erue Raphael',
    attendees: [
      {
        employeeId: 'emp-1',
        employeeName: 'Ibeh Udochukwu Gift Temitope',
        status: 'present',
      },
    ],
    editorialPriorities: ['Breaking Transfer Updates'],
  },
}));

vi.mock('@/models/Standup', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockStandup]),
    }),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'standup-new', ...data })),
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    find: vi.fn().mockResolvedValue([
      {
        _id: 'emp-1',
        fullName: 'Ibeh Udochukwu Gift Temitope',
        status: 'training',
      },
    ]),
  },
}));

import { GET, POST } from '../route';

describe('Standups API (/api/standups)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list standup meetings on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/standups');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].hostName).toBe('Ekpenisi Erue Raphael');
  });

  it('should validate meeting date on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/standups', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should schedule a standup and populate attendees on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/standups', {
      method: 'POST',
      body: JSON.stringify({
        meetingDate: '2026-09-02',
        time: '5:00 PM – 5:30 PM WAT',
        editorialPriorities: ['Matchday Preview Analysis'],
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.meetingDate).toBe('2026-09-02');
  });
});
