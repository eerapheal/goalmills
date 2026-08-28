import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const employee = await Employee.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

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
    await dbConnect();
    const { id } = await params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Employee removed successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
