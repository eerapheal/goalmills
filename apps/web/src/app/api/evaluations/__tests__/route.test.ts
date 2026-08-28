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


const { mockEvaluation } = vi.hoisted(() => ({
  mockEvaluation: {
    _id: 'eval-1',
    employeeId: 'emp-1',
    employeeName: 'Ibeh Udochukwu Gift Temitope',
    period: '30-Day Training Assessment',
    totalWeightedScore: 88,
    grade: 'A',
    transitionRecommendation: 'promote_to_regular',
  },
}));

vi.mock('@/models/PerformanceEvaluation', () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockEvaluation]),
    }),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'eval-new', ...data })),
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    findById: vi.fn().mockResolvedValue({
      _id: 'emp-1',
      fullName: 'Ibeh Udochukwu Gift Temitope',
      currentSalary: 30000,
      save: vi.fn().mockResolvedValue(true),
    }),
  },
}));

import { GET, POST } from '../route';

describe('Evaluations API (/api/evaluations)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list evaluations on GET', async () => {
    const req = new NextRequest('http://localhost:3000/api/evaluations');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].grade).toBe('A');
  });

  it('should compute weighted score, grade, and create evaluation on POST', async () => {
    const metrics = [
      { key: 'writing', name: 'Writing', weight: 50, score: 90 },
      { key: 'seo', name: 'SEO', weight: 50, score: 80 },
    ];

    const req = new NextRequest('http://localhost:3000/api/evaluations', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-1',
        period: '30-Day Assessment',
        metrics,
        strengths: 'Fast breaking news reporting',
        areasForImprovement: 'Expand Canva graphics',
        transitionRecommendation: 'promote_to_regular',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.totalWeightedScore).toBe(85);
    expect(json.data.grade).toBe('A');
  });
});
