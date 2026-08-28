import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PerformanceEvaluation from '@/models/PerformanceEvaluation';
import Employee from '@/models/Employee';
import { OFFICIAL_SCORECARD_METRICS } from '@/lib/trainingCurriculum';
import { hasPermission } from '@/lib/rbac';
import { requirePermission } from '@/lib/serverAuth';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isValidObjectId } from '@/lib/security';
import type { UserRole } from '@goalmills/types';

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userRole = session.user.role as UserRole;
    const canManageAll = hasPermission(userRole, 'evaluations:read');

    const { searchParams } = new URL(req.url);
    const requestedEmployeeId = searchParams.get('employeeId');

    const query: any = {};

    if (canManageAll) {
      if (requestedEmployeeId && isValidObjectId(requestedEmployeeId)) {
        query.employeeId = requestedEmployeeId;
      }
    } else {
      // Regular staff: only own evaluations
      const myEmployee = await Employee.findOne({
        $or: [
          { userId: session.user.id },
          { email: session.user.email?.toLowerCase() },
        ],
      });

      if (!myEmployee) {
        return NextResponse.json({
          success: true,
          count: 0,
          data: [],
          defaultMetrics: OFFICIAL_SCORECARD_METRICS,
        });
      }

      query.employeeId = myEmployee._id;
    }

    const evaluations = await PerformanceEvaluation.find(query).sort({ evaluationDate: -1 });

    return NextResponse.json({
      success: true,
      count: evaluations.length,
      data: evaluations,
      defaultMetrics: OFFICIAL_SCORECARD_METRICS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const { error } = await requirePermission('evaluations:manage');
    if (error) return error;

    await dbConnect();
    const body = await req.json();
    const {
      employeeId,
      period,
      evaluationDate,
      metrics,
      strengths,
      areasForImprovement,
      transitionRecommendation,
    } = body;

    if (!employeeId || !metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and scorecard metrics array are required' },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Calculate total weighted score
    let totalScore = 0;
    metrics.forEach((m: any) => {
      totalScore += (Number(m.score || 0) * Number(m.weight || 0)) / 100;
    });
    totalScore = Math.round(totalScore * 10) / 10;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (totalScore >= 85) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 55) grade = 'C';
    else if (totalScore >= 40) grade = 'D';
    else grade = 'F';

    const evaluation = await PerformanceEvaluation.create({
      employeeId,
      employeeName: employee.fullName,
      period: period || '30-Day Training Assessment',
      evaluationDate: evaluationDate || new Date().toISOString().split('T')[0],
      evaluatorName: 'Ekpenisi Erue Raphael',
      evaluatorRole: 'Founder / Managing Editor',
      metrics,
      totalWeightedScore: totalScore,
      grade,
      strengths: strengths || '',
      areasForImprovement: areasForImprovement || '',
      transitionRecommendation: transitionRecommendation || 'promote_to_regular',
      recommendedSalary:
        transitionRecommendation === 'promote_to_regular' ? 50000 : employee.currentSalary,
    });

    // If promoted to regular, update employee status and salary
    if (transitionRecommendation === 'promote_to_regular') {
      employee.status = 'active';
      employee.currentSalary = 50000;
      await employee.save();
    }

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit performance evaluation' },
      { status: 500 }
    );
  }
}
