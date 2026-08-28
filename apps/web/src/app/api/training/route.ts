import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TrainingProgress from '@/models/TrainingProgress';
import Employee from '@/models/Employee';
import { GOALMILLS_TRAINING_MODULES } from '@/lib/trainingCurriculum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { success: true, curriculum: GOALMILLS_TRAINING_MODULES },
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
        overallProgressPercent: 0,
        finalAssessmentCompleted: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: progress,
      curriculum: GOALMILLS_TRAINING_MODULES,
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
        overallProgressPercent: 0,
        finalAssessmentCompleted: false,
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

    // Calculate overall completion percent
    const completedCount = progress.modules.filter((m: any) => m.status === 'completed').length;
    progress.overallProgressPercent = Math.round(
      (completedCount / GOALMILLS_TRAINING_MODULES.length) * 100
    );

    await progress.save();

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update training progress' },
      { status: 500 }
    );
  }
}
