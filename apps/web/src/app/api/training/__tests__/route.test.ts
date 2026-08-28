import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const mockProgress = {
  _id: 'tp-1',
  employeeId: 'emp-1',
  modules: [
    {
      moduleId: 'sports_writing',
      status: 'in_progress',
      completedTasks: ['Draft match preview'],
      submissionLinks: [],
    },
  ],
  overallProgressPercent: 10,
  finalAssessmentCompleted: false,
  save: vi.fn().mockResolvedValue(true),
};

vi.mock('@/models/TrainingProgress', () => ({
  default: {
    findOne: vi.fn().mockImplementation(() => Promise.resolve(mockProgress)),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, save: vi.fn() })),
  },
}));

vi.mock('@/models/Employee', () => ({
  default: {
    findById: vi.fn().mockResolvedValue({ _id: 'emp-1', fullName: 'Test Employee' }),
  },
}));

import { GET, POST } from '../route';

describe('Training Progress API (/api/training)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return curriculum only when no employeeId is specified', async () => {
    const req = new NextRequest('http://localhost:3000/api/training');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.curriculum).toBeDefined();
    expect(json.curriculum.length).toBeGreaterThan(0);
  });

  it('should return employee training progress when employeeId is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/training?employeeId=emp-1');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.employeeId).toBe('emp-1');
  });

  it('should update module progress on POST', async () => {
    const req = new NextRequest('http://localhost:3000/api/training', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-1',
        moduleId: 'sports_writing',
        completedTasks: ['Task 1', 'Task 2'],
        status: 'in_progress',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
