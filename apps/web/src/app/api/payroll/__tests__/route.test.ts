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


const { mockPayrollRecord } = vi.hoisted(() => ({
  mockPayrollRecord: {
    _id: 'pay-1',
    employeeId: 'emp-1',
    employeeName: 'Ibeh Udochukwu Gift Temitope',
    jobTitle: 'Sports Media & Social Media Content Officer',
    period: 'September 2026',
    paymentType: 'training_allowance',
    baseAmount: 30000,
    bonusAmount: 0,
    deductions: 0,
    netPay: 30000,
    currency: 'NGN',
    status: 'approved',
  },
}));

vi.mock('@/models/Payroll', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockPayrollRecord]),
    }),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'pay-new', ...data })),
    findByIdAndUpdate: vi.fn().mockResolvedValue({ ...mockPayrollRecord, status: 'paid' }),
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    findById: vi.fn().mockResolvedValue({
      _id: 'emp-1',
      fullName: 'Ibeh Udochukwu Gift Temitope',
      jobTitle: 'Sports Media Officer',
      currentSalary: 30000,
      status: 'training',
    }),
    find: vi.fn().mockResolvedValue([]),
  },
}));

import { GET, POST, PATCH } from '../route';

describe('Payroll API (/api/payroll)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list payroll records on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/payroll');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].netPay).toBe(30000);
  });

  it('should create a payroll record on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/payroll', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-1',
        period: 'October 2026',
        baseAmount: 30000,
        bonusAmount: 5000,
        deductions: 0,
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.netPay).toBe(35000);
  });

  it('should update payment status on PATCH', async () => {
    const req = new NextRequest('http://localhost:3000/api/payroll', {
      method: 'PATCH',
      body: JSON.stringify({
        payrollId: 'pay-1',
        status: 'paid',
      }),
    });

    const response = await PATCH(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('paid');
  });
});
