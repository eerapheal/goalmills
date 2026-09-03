import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TrainingProgress from '@/models/TrainingProgress';
import Employee from '@/models/Employee';
import {
  GOALMILLS_TRAINING_MODULES,
  GOALMILLS_30_DAY_CURRICULUM,
  NEWSROOM_DAILY_TIMETABLE,
  NEWSROOM_STANDUP_PROTOCOL,
  DAILY_SCORECARD_RUBRICS,
  CERTIFICATION_TIERS,
  EDITORIAL_POLICIES,
} from '@/lib/trainingCurriculum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const includeCurriculum = searchParams.get('curriculum') === 'true';

    // If no employee specified, return full curriculum data
    if (!employeeId) {
      return NextResponse.json(
        {
          success: true,
          curriculum: GOALMILLS_TRAINING_MODULES,
          ...(includeCurriculum && {
            days: GOALMILLS_30_DAY_CURRICULUM,
            timetable: NEWSROOM_DAILY_TIMETABLE,
            standup: NEWSROOM_STANDUP_PROTOCOL,
            scorecardRubrics: DAILY_SCORECARD_RUBRICS,
            certificationTiers: CERTIFICATION_TIERS,
            editorialPolicies: EDITORIAL_POLICIES,
          }),
        },
        { status: 200 }
      );
    }

    let progress = await TrainingProgress.findOne({ employeeId });

    if (!progress) {
      const emp = await Employee.findById(employeeId);
      if (!emp) {
        return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
      }

      progress = await TrainingProgress.create({
        employeeId,
        modules: GOALMILLS_TRAINING_MODULES.map((m) => ({
          moduleId: m.id,
          status: 'not_started',
          completedTasks: [],
          submissionLinks: [],
        })),
        completedDays: [],
        completedDaysCount: 0,
        mandatoryDaysTotal: 30,
        dailyRecords: [],
        overallProgressPercent: 0,
        finalAssessmentCompleted: false,
        isCertified: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
      curriculum: GOALMILLS_TRAINING_MODULES,
      ...(includeCurriculum && {
        days: GOALMILLS_30_DAY_CURRICULUM,
        timetable: NEWSROOM_DAILY_TIMETABLE,
        standup: NEWSROOM_STANDUP_PROTOCOL,
        scorecardRubrics: DAILY_SCORECARD_RUBRICS,
        certificationTiers: CERTIFICATION_TIERS,
        editorialPolicies: EDITORIAL_POLICIES,
      }),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch training progress' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { employeeId, moduleId, completedTasks, submissionLinks, status, score, feedback } = body;

    if (!employeeId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Module ID are required' },
        { status: 400 }
      );
    }

    let progress = await TrainingProgress.findOne({ employeeId });

    if (!progress) {
      progress = await TrainingProgress.create({
        employeeId,
        modules: GOALMILLS_TRAINING_MODULES.map((m) => ({
          moduleId: m.id,
          status: 'not_started',
          completedTasks: [],
          submissionLinks: [],
        })),
        completedDays: [],
        completedDaysCount: 0,
        mandatoryDaysTotal: 30,
        dailyRecords: [],
        overallProgressPercent: 0,
        finalAssessmentCompleted: false,
        isCertified: false,
      });
    }

    const moduleIndex = progress.modules.findIndex((m: any) => m.moduleId === moduleId);
    if (moduleIndex >= 0) {
      if (completedTasks !== undefined)
        progress.modules[moduleIndex].completedTasks = completedTasks;
      if (submissionLinks !== undefined)
        progress.modules[moduleIndex].submissionLinks = submissionLinks;
      if (status !== undefined) progress.modules[moduleIndex].status = status;
      if (score !== undefined) progress.modules[moduleIndex].score = score;
      if (feedback !== undefined) progress.modules[moduleIndex].feedback = feedback;
      if (status === 'completed')
        progress.modules[moduleIndex].completedAt = new Date().toISOString();
    } else {
      progress.modules.push({
        moduleId,
        status: status || 'in_progress',
        completedTasks: completedTasks || [],
        submissionLinks: submissionLinks || [],
        score,
        feedback,
      });
    }

    // Calculate overall completion percent (uses both module completion and 30-day completion)
    const moduleCompletedCount = progress.modules.filter(
      (m: any) => m.status === 'completed'
    ).length;
    const modulePercent = Math.round(
      (moduleCompletedCount / GOALMILLS_TRAINING_MODULES.length) * 100
    );
    const dayPercent = Math.round(
      ((progress.completedDays?.length || 0) / 30) * 100
    );
    // Use the higher of module-based or day-based progress
    progress.overallProgressPercent = Math.max(modulePercent, dayPercent);

    // Update completedDaysCount to stay in sync
    progress.completedDaysCount = progress.completedDays?.length || 0;

    await progress.save();

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update training progress' },
      { status: 500 }
    );
  }
}
