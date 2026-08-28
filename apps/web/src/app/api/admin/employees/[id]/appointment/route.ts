import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { AppointmentLetterData } from '@goalmills/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
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
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    if (!body.employeeSignature) {
      return NextResponse.json(
        { success: false, error: 'Signature is required to accept the appointment' },
        { status: 400 }
      );
    }

    const signedAt = new Date().toLocaleDateString('en-GB');

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        $set: {
          appointmentSigned: true,
          appointmentSignedAt: signedAt,
          employeeSignature: body.employeeSignature,
        },
      },
      { new: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

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
