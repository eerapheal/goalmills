import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import User from '@/models/User';
import TrainingProgress from '@/models/TrainingProgress';
import { GOALMILLS_TRAINING_MODULES } from '@/lib/trainingCurriculum';
import { hasPermission } from '@/lib/rbac';
import { requirePermission } from '@/lib/serverAuth';

import { sanitizeObject, escapeRegex } from '@/lib/security';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { UserRole } from '@goalmills/types';

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userRole = session.user.role as UserRole;
    const { searchParams } = new URL(req.url);
    const selfOnly = searchParams.get('self') === 'true';

    // If regular staff or self-only requested, return only their own profile
    if (selfOnly || !hasPermission(userRole, 'employees:read')) {
      const myEmployee = await Employee.findOne({
        $or: [
          { userId: session.user.id },
          { email: session.user.email?.toLowerCase() },
        ],
      });

      if (!myEmployee) {
        return NextResponse.json({ success: true, count: 0, data: [] });
      }

      return NextResponse.json({ success: true, count: 1, data: [myEmployee] });
    }

    // Manager / Super Admin full directory search
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
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { jobTitle: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    let employees = await Employee.find(query).sort({ createdAt: -1 });

    // If no employees exist yet, seed initial employee (Ibeh Udochukwu Gift Temitope)
    if (employees.length === 0 && !search && (!status || status === 'all')) {
      const defaultEmail = 'giftibeh585@gmail.com';
      let defaultUser = await User.findOne({ email: defaultEmail });
      if (!defaultUser) {
        const hashedPassword = await bcrypt.hash('GoalMills2026!', 10);
        defaultUser = await User.create({
          username: 'Ibeh Udochukwu Gift Temitope',
          email: defaultEmail,
          password: hashedPassword,
          role: 'staff',
        });
      }

      const defaultEmployee = await Employee.create({
        userId: defaultUser._id,
        fullName: 'Ibeh Udochukwu Gift Temitope',
        email: defaultEmail,
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
    const rawBody = await req.json();
    const body = sanitizeObject(rawBody);

    if (!body.fullName || !body.email || !body.phone || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, and address are required' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const existingEmp = await Employee.findOne({ email });
    if (existingEmp) {
      return NextResponse.json(
        { success: false, error: 'An employee with this email already exists' },
        { status: 409 }
      );
    }

    // Determine or generate user password
    const plainPassword =
      body.password && body.password.length >= 6
        ? body.password
        : `GM${Math.random().toString(36).substring(2, 7)}!2026`;

    // Create or link User login account
    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      user = await User.create({
        username: body.fullName.trim(),
        email,
        password: hashedPassword,
        role: body.role || 'staff',
      });
    } else if (body.role && user.role !== body.role) {
      user.role = body.role;
      await user.save();
    }

    const employee = await Employee.create({
      ...body,
      userId: user._id,
      email,
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

    return NextResponse.json(
      {
        success: true,
        data: employee,
        credentials: {
          email: user.email,
          tempPassword: plainPassword,
          role: user.role,
          fullName: employee.fullName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}

