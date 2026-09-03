import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { AppointmentLetterData, UserRole } from '@goalmills/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import { isValidObjectId, sanitizeHtml } from '@/lib/security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid employee ID' }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOne({
      $or: [{ _id: id }, { userId: id }],
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Permission check: Manager/Super-admin or self employee
    const userRole = session.user.role as UserRole;
    const isManagerOrAdmin = hasPermission(userRole, 'employees:read');
    const isSelf =
      (employee.userId && employee.userId.toString() === session.user.id) ||
      (employee.email &&
        session.user.email &&
        employee.email.trim().toLowerCase() === session.user.email.trim().toLowerCase()) ||
      (employee._id.toString() === id && session.user.role !== 'user');

    if (!isManagerOrAdmin && !isSelf) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You cannot access another staff member's appointment letter",
        },
        { status: 403 }
      );
    }

    // If staff user is viewing their own contract and userId is not yet linked, link it now
    if (!employee.userId && session.user.id && isSelf) {
      await Employee.findByIdAndUpdate(employee._id, { $set: { userId: session.user.id } });
    }

    const appointmentData: AppointmentLetterData = {
      companyName: 'GOALMILLS',
      companyPhone: '+2347084988228',
      companyEmail: 'support@goalmills.com',
      companyWebsite: 'https://goalmills-web.vercel.app',
      date: '27 August 2026',
      candidateName: employee.fullName,
      candidateAddress: employee.address,
      candidateEmail: employee.email,
      candidatePhone: employee.phone,
      position: employee.jobTitle || 'Sports Media & Social Media Content Officer',
      department: employee.department || 'Editorial & Digital Media',
      startDate: employee.startDate || '1 September 2026',
      trainingPeriod: `${employee.startDate || '1 September 2026'} – ${employee.trainingEndDate || '30 September 2026'}`,
      workArrangement: employee.workArrangement || 'Remote',
      reportsTo: employee.reportsTo || 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
      trainingSalary: employee.trainingAllowance || 30000,
      startingSalary: employee.startingSalary || 50000,
      founderName: 'Ekpenisi Erue Raphael',
      founderPosition: 'Founder',
      founderSignatureDate: '27/08/2026',
      employeeSignature: employee.employeeSignature,
      employeeSignatureDate: employee.appointmentSignedAt,
      isAccepted: employee.appointmentSigned || false,
    };

    return NextResponse.json({ success: true, data: appointmentData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch appointment letter' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid employee ID' }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOne({
      $or: [{ _id: id }, { userId: id }],
    });
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Permission check: Self or Manager+
    const userRole = session.user.role as UserRole;
    const isManagerOrAdmin = hasPermission(userRole, 'employees:manage');
    const isSelf =
      (employee.userId && employee.userId.toString() === session.user.id) ||
      (employee.email &&
        session.user.email &&
        employee.email.trim().toLowerCase() === session.user.email.trim().toLowerCase()) ||
      (employee._id.toString() === id && session.user.role !== 'user');

    if (!isManagerOrAdmin && !isSelf) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You cannot sign an appointment letter for another employee',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.employeeSignature) {
      return NextResponse.json(
        { success: false, error: 'Signature is required to accept the appointment' },
        { status: 400 }
      );
    }

    const cleanSignature = sanitizeHtml(body.employeeSignature);
    const signedAt = new Date().toLocaleDateString('en-GB');

    const updateFields: any = {
      appointmentSigned: true,
      appointmentSignedAt: signedAt,
      employeeSignature: cleanSignature,
    };

    if (!employee.userId && session?.user?.id) {
      updateFields.userId = session.user.id;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment letter successfully signed and accepted',
      data: updatedEmployee,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sign appointment letter' },
      { status: 500 }
    );
  }
}
