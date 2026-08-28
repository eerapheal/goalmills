import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyReport from '@/models/DailyReport';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (date) query.reportDate = date;
    if (status && status !== 'all') query.reviewStatus = status;

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

    const report = await DailyReport.create({
      ...body,
      employeeName,
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
    await dbConnect();
    const body = await req.json();
    const { reportId, reviewStatus, editorScore, editorFeedback, reviewedBy } = body;

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'Report ID is required' }, { status: 400 });
    }

    const updateData: any = {
      reviewStatus: reviewStatus || 'reviewed',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || 'Ekpenisi Erue Raphael (Managing Editor)',
    };

    if (editorScore !== undefined) updateData.editorScore = editorScore;
    if (editorFeedback !== undefined) updateData.editorFeedback = editorFeedback;

    const updated = await DailyReport.findByIdAndUpdate(reportId, { $set: updateData }, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update report review' },
      { status: 500 }
    );
  }
}
