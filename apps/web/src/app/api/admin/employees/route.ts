import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import TrainingProgress from '@/models/TrainingProgress';
import { GOALMILLS_TRAINING_MODULES } from '@/lib/trainingCurriculum';
import { requirePermission } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    // RBAC: Only manager+ can view employee directory
    const { error } = await requirePermission('employees:read');
    if (error) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const department = searchParams.get('department');

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    let employees = await Employee.find(query).sort({ createdAt: -1 });

    // If no employees exist yet, seed initial employee (Ibeh Udochukwu Gift Temitope)
    if (employees.length === 0 && !search && (!status || status === 'all')) {
      const defaultEmployee = await Employee.create({
        fullName: 'Ibeh Udochukwu Gift Temitope',
        email: 'giftibeh585@gmail.com',
        phone: '08134336192',
        address: 'No 35 church street, Jos, Plateau State',
        jobTitle: 'Sports Media & Social Media Content Officer',
        department: 'Editorial & Digital Media',
        workArrangement: 'Remote',
        reportsTo: 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
        startDate: '2026-09-01',
        trainingEndDate: '2026-09-30',
        status: 'training',
        trainingAllowance: 30000,
        startingSalary: 50000,
        currentSalary: 30000,
        currency: 'NGN',
        appointmentSigned: false,
        companySignature: 'Ekpenisi Erue Raphael',
        companyRepresentative: 'Founder',
      });

      // Initialize training progress
      await TrainingProgress.create({
        employeeId: defaultEmployee._id,
        modules: GOALMILLS_TRAINING_MODULES.map((m) => ({
          moduleId: m.id,
          status: 'in_progress',
          completedTasks: [],
          submissionLinks: [],
        })),
        overallProgressPercent: 0,
        finalAssessmentCompleted: false,
      });

      employees = [defaultEmployee];
    }

    return NextResponse.json({ success: true, count: employees.length, data: employees });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // RBAC: Only manager+ can onboard new staff
    const { error } = await requirePermission('employees:onboard');
    if (error) return error;

    await dbConnect();
    const body = await req.json();

    if (!body.fullName || !body.email || !body.phone || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, and address are required' },
        { status: 400 }
      );
    }

    const existing = await Employee.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An employee with this email already exists' },
        { status: 409 }
      );
    }

    const employee = await Employee.create({
      ...body,
      status: body.status || 'training',
      trainingAllowance: body.trainingAllowance || 30000,
      startingSalary: body.startingSalary || 50000,
      currentSalary: body.currentSalary || body.trainingAllowance || 30000,
      currency: 'NGN',
      appointmentSigned: false,
      companySignature: 'Ekpenisi Erue Raphael',
      companyRepresentative: 'Founder',
    });

    // Auto-create training progress profile
    await TrainingProgress.create({
      employeeId: employee._id,
      modules: GOALMILLS_TRAINING_MODULES.map((m) => ({
        moduleId: m.id,
        status: 'not_started',
        completedTasks: [],
        submissionLinks: [],
      })),
      overallProgressPercent: 0,
      finalAssessmentCompleted: false,
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}
