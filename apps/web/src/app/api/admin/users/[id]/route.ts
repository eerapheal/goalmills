import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Employee from '@/models/Employee';
import DailyReport from '@/models/DailyReport';
import PerformanceEvaluation from '@/models/PerformanceEvaluation';
import Payroll from '@/models/Payroll';
import TrainingProgress from '@/models/TrainingProgress';
import Standup from '@/models/Standup';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;

  if (!session || session.user.role !== 'super-admin') {
    return NextResponse.json(
      { message: 'Unauthorized: Super Admin role required' },
      { status: 401 }
    );
  }

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json(
      { message: 'Forbidden: You cannot delete your own account' },
      { status: 403 }
    );
  }

  await dbConnect();
  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find linked employees by userId or email
    const employees = await Employee.find({
      $or: [{ userId: user._id }, { email: user.email?.toLowerCase() }],
    });
    const employeeIds = employees.map((e) => e._id);

    if (employeeIds.length > 0) {
      // Cascade delete all associated staff documents
      await Promise.all([
        DailyReport.deleteMany({ employeeId: { $in: employeeIds } }),
        PerformanceEvaluation.deleteMany({ employeeId: { $in: employeeIds } }),
        Payroll.deleteMany({ employeeId: { $in: employeeIds } }),
        TrainingProgress.deleteMany({ employeeId: { $in: employeeIds } }),
        Standup.updateMany(
          {},
          {
            $pull: {
              attendees: { employeeId: { $in: employeeIds } },
              nextDayAssignments: { employeeId: { $in: employeeIds } },
            },
          }
        ),
        Employee.deleteMany({ _id: { $in: employeeIds } }),
      ]);
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'User account and all associated staff records deleted completely from DB',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Error deleting user' },
      { status: 500 }
    );
  }
}
