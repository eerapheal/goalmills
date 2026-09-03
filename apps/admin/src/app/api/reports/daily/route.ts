import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyReport from '@/models/DailyReport';
import Employee from '@/models/Employee';
import TrainingProgress from '@/models/TrainingProgress';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import { requirePermission } from '@/lib/serverAuth';
import { notifyStaffGradedAssignment } from '@/lib/trainingNotificationService';
import { GOALMILLS_30_DAY_CURRICULUM, CERTIFICATION_TIERS } from '@/lib/trainingCurriculum';

import { UserRole } from '@goalmills/types';

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    if (!hasPermission(userRole, 'reports:read_own')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const trainingDay = searchParams.get('trainingDay');

    const query: any = {};
    if (date) query.reportDate = date;
    if (status && status !== 'all') query.reviewStatus = status;
    if (trainingDay) query.trainingDay = parseInt(trainingDay, 10);

    const canViewAll = hasPermission(userRole, 'reports:read_all');
    if (canViewAll) {
      if (employeeId) query.employeeId = employeeId;
    } else {
      // Staff/Editor: only see their own reports
      const myEmployee = await Employee.findOne({
        $or: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      });
      if (myEmployee) {
        query.employeeId = myEmployee._id;
      } else if (employeeId) {
        query.employeeId = employeeId;
      }
    }

    const reports = await DailyReport.find(query).sort({ reportDate: -1, createdAt: -1 });

    return NextResponse.json({ success: true, count: reports.length, data: reports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch daily reports' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requirePermission('reports:submit');
    if (error) return error;

    await dbConnect();
    const body = await req.json();

    if (!body.employeeId || !body.reportDate || !body.tasksCompleted) {
      return NextResponse.json(
        { success: false, error: 'Employee ID, report date, and tasks completed are required' },
        { status: 400 }
      );
    }

    let employeeName = body.employeeName;
    if (!employeeName) {
      const emp = await Employee.findById(body.employeeId);
      employeeName = emp ? emp.fullName : 'GoalMills Team Member';
    }

    // Auto-populate lesson studied from curriculum if trainingDay is provided
    let lessonStudied = body.lessonStudied;
    if (!lessonStudied && body.trainingDay) {
      const dayData = GOALMILLS_30_DAY_CURRICULUM.find((d) => d.day === body.trainingDay);
      if (dayData) {
        lessonStudied = dayData.title;
      }
    }

    const report = await DailyReport.create({
      ...body,
      employeeName,
      lessonStudied,
      reviewStatus: 'pending',
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit daily report' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = session.user.role as UserRole;
    if (
      !hasPermission(userRole, 'handbook:manage') &&
      !hasPermission(userRole, 'evaluations:manage')
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Editor or Manager role required to review reports' },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const {
      reportId,
      reviewStatus,
      scorecard,
      editorFeedback,
      reviewedBy,
    } = body;

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'Report ID is required' }, { status: 400 });
    }

    // Calculate total score from the 10-category scorecard
    let totalScore = 0;
    let performanceRating = '';
    if (scorecard) {
      totalScore =
        (scorecard.research || 0) +
        (scorecard.accuracy || 0) +
        (scorecard.writing || 0) +
        (scorecard.seo || 0) +
        (scorecard.socialMedia || 0) +
        (scorecard.graphicDesign || 0) +
        (scorecard.creativity || 0) +
        (scorecard.publishingDiscipline || 0) +
        (scorecard.analyticsLearning || 0) +
        (scorecard.teamworkReporting || 0);

      if (totalScore >= 90) performanceRating = 'Excellent';
      else if (totalScore >= 80) performanceRating = 'Very Good';
      else if (totalScore >= 70) performanceRating = 'Good';
      else if (totalScore >= 60) performanceRating = 'Improvement Required';
      else performanceRating = 'Remedial Training';
    }

    const updateData: any = {
      reviewStatus: reviewStatus || 'reviewed',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || 'Ekpenisi Erue Raphael (Managing Editor)',
    };

    if (scorecard) updateData.scorecard = scorecard;
    if (totalScore > 0) {
      updateData.totalScore = totalScore;
      updateData.editorScore = totalScore;
      updateData.performanceRating = performanceRating;
    }
    if (editorFeedback !== undefined) updateData.editorFeedback = editorFeedback;

    const updated = await DailyReport.findByIdAndUpdate(
      reportId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // ============================================================
    // SYNC WITH TRAINING PROGRESS — Mark day as completed if approved
    // ============================================================
    if (
      updated.trainingDay &&
      (reviewStatus === 'approved' || reviewStatus === 'reviewed') &&
      totalScore >= 60
    ) {
      try {
        let progress = await TrainingProgress.findOne({ employeeId: updated.employeeId });

        if (!progress) {
          progress = await TrainingProgress.create({
            employeeId: updated.employeeId,
            completedDays: [],
            completedDaysCount: 0,
            mandatoryDaysTotal: 30,
            dailyRecords: [],
            modules: [],
            overallProgressPercent: 0,
            finalAssessmentCompleted: false,
            isCertified: false,
          });
        }

        const day = updated.trainingDay;

        // Add day to completedDays if not already there
        if (!progress.completedDays.includes(day)) {
          progress.completedDays.push(day);
          progress.completedDays.sort((a: number, b: number) => a - b);
        }

        // Upsert daily record
        const existingRecordIdx = progress.dailyRecords?.findIndex(
          (r: any) => r.day === day
        );
        const dailyRecord = {
          day,
          reportId: updated._id,
          score: totalScore,
          status: reviewStatus === 'approved' ? 'approved' : 'pending',
          gradedAt: new Date().toISOString(),
        };

        if (existingRecordIdx >= 0) {
          progress.dailyRecords[existingRecordIdx] = dailyRecord;
        } else {
          if (!progress.dailyRecords) progress.dailyRecords = [];
          progress.dailyRecords.push(dailyRecord);
        }

        // Recalculate progress
        progress.completedDaysCount = progress.completedDays.length;
        progress.overallProgressPercent = Math.round(
          (progress.completedDays.length / 30) * 100
        );

        // Check for 30-day certification
        if (progress.completedDays.length >= 30 && !progress.isCertified) {
          // Calculate average score across all graded days
          const gradedRecords = progress.dailyRecords.filter(
            (r: any) => r.score !== undefined
          );
          const avgScore =
            gradedRecords.length > 0
              ? Math.round(
                  gradedRecords.reduce((sum: number, r: any) => sum + r.score, 0) /
                    gradedRecords.length
                )
              : 0;

          progress.finalAssessmentCompleted = true;
          progress.finalAssessmentScore = avgScore;
          progress.isCertified = true;
          progress.certificationDate = new Date().toISOString();

          // Determine certification tier
          const tier = CERTIFICATION_TIERS.find(
            (t) => avgScore >= t.min && avgScore <= t.max
          );
          progress.certificationTier =
            tier?.title || 'GoalMills Certified Sports Media Professional';

          if (avgScore >= 70) {
            progress.transitionRecommended = true;
          }
        }

        await progress.save();
      } catch (syncErr) {
        console.error('[DailyReport PATCH] Error syncing training progress:', syncErr);
      }
    }

    // ============================================================
    // MULTI-CHANNEL GRADED NOTIFICATIONS (Email, Push, Dashboard)
    // ============================================================
    if (updated.trainingDay && scorecard && totalScore > 0) {
      try {
        const emp = await Employee.findById(updated.employeeId);
        const dayData = GOALMILLS_30_DAY_CURRICULUM.find(
          (d) => d.day === updated.trainingDay
        );

        await notifyStaffGradedAssignment({
          employeeId: updated.employeeId.toString(),
          employeeName: updated.employeeName || emp?.fullName || 'Staff Member',
          employeeEmail: emp?.email,
          trainingDay: updated.trainingDay,
          lessonStudied: updated.lessonStudied || dayData?.title || `Day ${updated.trainingDay}`,
          reportDate: updated.reportDate,
          totalScore,
          performanceRating,
          reviewStatus: reviewStatus || 'reviewed',
          scorecard,
          editorFeedback: editorFeedback || '',
          reviewedBy: reviewedBy || 'Ekpenisi Erue Raphael (Managing Editor)',
        });
      } catch (notifErr) {
        console.error('[DailyReport PATCH] Error dispatching notifications:', notifErr);
        // Non-blocking: don't fail the review because notification failed
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update report review' },
      { status: 500 }
    );
  }
}
