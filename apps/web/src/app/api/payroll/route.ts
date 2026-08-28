import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payroll from '@/models/Payroll';
import Employee from '@/models/Employee';
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
    const canManageAll = hasPermission(userRole, 'payroll:read');

    const { searchParams } = new URL(req.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const period = searchParams.get('period');
    const status = searchParams.get('status');

    const query: any = {};
    if (period) query.period = period;
    if (status && status !== 'all') query.status = status;

    if (canManageAll) {
      // Super admin / manager: can filter by any employee or see all
      if (requestedEmployeeId && isValidObjectId(requestedEmployeeId)) {
        query.employeeId = requestedEmployeeId;
      }
    } else {
      // Regular staff: find their own employee record and force filter
      const myEmployee = await Employee.findOne({
        $or: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      });

      if (!myEmployee) {
        return NextResponse.json({ success: true, count: 0, data: [] });
      }

      // Lock query to the current staff member's ID
      query.employeeId = myEmployee._id;
    }

    let records = await Payroll.find(query).sort({ createdAt: -1 });

    // If no payroll records exist and super admin is querying all, seed current period records
    if (records.length === 0 && canManageAll && !requestedEmployeeId) {
      const employees = await Employee.find({
        status: { $in: ['training', 'probation', 'active'] },
      });
      const created = [];
      for (const emp of employees) {
        const isTraining = emp.status === 'training';
        const baseAmount = isTraining ? emp.trainingAllowance || 30000 : emp.currentSalary || 50000;
        const newRecord = await Payroll.create({
          employeeId: emp._id,
          employeeName: emp.fullName,
          jobTitle: emp.jobTitle || 'Sports Media & Social Media Content Officer',
          period: 'September 2026',
          paymentType: isTraining ? 'training_allowance' : 'regular_salary',
          baseAmount,
          bonusAmount: 0,
          deductions: 0,
          netPay: baseAmount,
          currency: 'NGN',
          status: 'approved',
          paymentMethod: 'Bank Transfer',
          referenceNumber: `GM-PAY-${Date.now().toString().slice(-6)}`,
          notes: isTraining ? 'Initial 30-Day Training Stipend' : 'Standard Monthly Salary',
        });
        created.push(newRecord);
      }
      records = created;
    }

    return NextResponse.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payroll records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requirePermission('payroll:manage');
    if (error) return error;

    await dbConnect();
    const body = await req.json();
    const { employeeId, period, paymentType, baseAmount, bonusAmount, deductions, notes } = body;

    if (!employeeId || !period) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and period are required' },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    const base = Number(baseAmount !== undefined ? baseAmount : employee.currentSalary || 30000);
    const bonus = Number(bonusAmount || 0);
    const ded = Number(deductions || 0);
    const net = base + bonus - ded;

    const record = await Payroll.create({
      employeeId,
      employeeName: employee.fullName,
      jobTitle: employee.jobTitle,
      period,
      paymentType:
        paymentType || (employee.status === 'training' ? 'training_allowance' : 'regular_salary'),
      baseAmount: base,
      bonusAmount: bonus,
      deductions: ded,
      netPay: net,
      currency: 'NGN',
      status: 'approved',
      paymentMethod: 'Bank Transfer',
      referenceNumber: `GM-PAY-${Date.now().toString().slice(-6)}`,
      notes: notes || '',
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payroll record' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await requirePermission('payroll:manage');
    if (error) return error;

    await dbConnect();
    const body = await req.json();
    const { payrollId, status, paymentDate, referenceNumber, notes } = body;

    if (!payrollId) {
      return NextResponse.json(
        { success: false, error: 'Payroll ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentDate) updateData.paymentDate = paymentDate;
    if (referenceNumber) updateData.referenceNumber = referenceNumber;
    if (notes !== undefined) updateData.notes = notes;

    if (status === 'paid' && !updateData.paymentDate) {
      updateData.paymentDate = new Date().toISOString().split('T')[0];
    }

    const updated = await Payroll.findByIdAndUpdate(payrollId, { $set: updateData }, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payroll record' },
      { status: 500 }
    );
  }
}
