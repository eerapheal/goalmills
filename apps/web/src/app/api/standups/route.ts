import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Standup from '@/models/Standup';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import { requirePermission } from '@/lib/serverAuth';

import { UserRole } from '@goalmills/types';

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    if (!hasPermission(userRole, 'standup:attend')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const query: any = {};
    if (date) query.meetingDate = date;

    const canViewAll = hasPermission(userRole, 'standup:view_all');
    if (!canViewAll) {
      // Staff: only view their own standups for the last 3 months (90 days)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
      const minDateStr = threeMonthsAgo.toISOString().split('T')[0];

      query.createdAt = { $gte: threeMonthsAgo };

      const myEmployee = await Employee.findOne({
        $or: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      });
      if (myEmployee) {
        query['attendees.employeeId'] = myEmployee._id;
      }
    }

    const standups = await Standup.find(query).sort({ meetingDate: -1, createdAt: -1 });

    return NextResponse.json({ success: true, count: standups.length, data: standups });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch standup meetings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requirePermission('standup:schedule');
    if (error) return error;

    await dbConnect();
    const body = await req.json();

    if (!body.meetingDate) {
      return NextResponse.json(
        { success: false, error: 'Meeting date is required' },
        { status: 400 }
      );
    }

    // Auto-populate active employees if attendees empty
    let attendees = body.attendees;
    if (!attendees || attendees.length === 0) {
      const activeEmployees = await Employee.find({
        status: { $in: ['training', 'probation', 'active'] },
      });
      attendees = activeEmployees.map((emp) => ({
        employeeId: emp._id,
        employeeName: emp.fullName,
        status: 'present',
        talkingPoints: '',
      }));
    }

    const standup = await Standup.create({
      meetingDate: body.meetingDate,
      time: body.time || '5:00 PM – 5:30 PM WAT',
      platform: body.platform || 'Google Meet',
      meetUrl: body.meetUrl || 'https://meet.google.com/goalmills-newsroom',
      hostName: body.hostName || 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
      attendees,
      agenda: body.agenda || [
        'Review daily published articles and breaking sports coverage',
        'Assess Canva graphics and short-form video output',
        'Address editorial corrections, fact-checking and source accuracy',
        'Outline next-day matchday and newsroom assignments',
      ],
      editorialPriorities: body.editorialPriorities || [],
      nextDayAssignments: body.nextDayAssignments || [],
      meetingNotes: body.meetingNotes || '',
    });

    return NextResponse.json({ success: true, data: standup }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to schedule standup meeting' },
      { status: 500 }
    );
  }
}
