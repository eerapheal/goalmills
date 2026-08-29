import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import User from '@/models/User';
import DailyReport from '@/models/DailyReport';
import PerformanceEvaluation from '@/models/PerformanceEvaluation';
import Payroll from '@/models/Payroll';
import TrainingProgress from '@/models/TrainingProgress';
import Standup from '@/models/Standup';
import { requirePermission } from '@/lib/serverAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requirePermission('employees:read');
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requirePermission('employees:manage');
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requirePermission('employees:manage');
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Cascade delete all associated staff records from DB
    await Promise.all([
      DailyReport.deleteMany({ employeeId: employee._id }),
      PerformanceEvaluation.deleteMany({ employeeId: employee._id }),
      Payroll.deleteMany({ employeeId: employee._id }),
      TrainingProgress.deleteMany({ employeeId: employee._id }),
      Standup.updateMany(
        {},
        {
          $pull: {
            attendees: { employeeId: employee._id },
            nextDayAssignments: { employeeId: employee._id },
          },
        }
      ),
      // Remove corresponding user login account if exists
      employee.userId
        ? User.findByIdAndDelete(employee.userId)
        : User.findOneAndDelete({ email: employee.email.toLowerCase() }),
      Employee.findByIdAndDelete(id),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Employee and all associated data completely removed from database',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
