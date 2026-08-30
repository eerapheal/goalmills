import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tenant from '@/models/Tenant';
import { requirePermission } from '@/lib/serverAuth';
import { DEFAULT_TENANT, DEFAULT_TENANT_ID } from '@/lib/tenantContext';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission('system:settings');
  if (error) return error;

  const { id } = await params;

  if (id === DEFAULT_TENANT_ID || id === 'goalmills') {
    return NextResponse.json({ success: true, tenant: DEFAULT_TENANT });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid tenant ID' }, { status: 400 });
  }

  await dbConnect();
  try {
    const tenant = await Tenant.findById(id).lean();
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    console.error('Error fetching tenant:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch tenant' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission('system:settings');
  if (error) return error;

  const { id } = await params;

  if (id === DEFAULT_TENANT_ID || id === 'goalmills') {
    return NextResponse.json(
      { success: false, error: 'Cannot modify primary platform tenant configuration' },
      { status: 403 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid tenant ID' }, { status: 400 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const { name, status, plan, customDomain, settings, features } = body;

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (status && ['active', 'suspended', 'trial', 'cancelled'].includes(status)) {
      updateFields.status = status;
    }
    if (plan && ['free', 'creator', 'publisher', 'enterprise'].includes(plan)) {
      updateFields.plan = plan;
    }
    if (customDomain !== undefined) {
      updateFields.customDomain = customDomain ? customDomain.toLowerCase().trim() : undefined;
    }
    if (settings) updateFields.settings = settings;
    if (features) updateFields.features = features;

    const updated = await Tenant.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Tenant "${updated.name}" updated successfully`,
      tenant: updated,
    });
  } catch (err: any) {
    console.error('Error updating tenant:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update tenant' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission('system:settings');
  if (error) return error;

  const { id } = await params;

  if (id === DEFAULT_TENANT_ID || id === 'goalmills') {
    return NextResponse.json(
      { success: false, error: 'Cannot delete primary platform tenant' },
      { status: 403 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid tenant ID' }, { status: 400 });
  }

  await dbConnect();
  try {
    // Soft suspend / cancel tenant rather than hard purging records
    const cancelled = await Tenant.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    ).lean();

    if (!cancelled) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Tenant "${cancelled.name}" has been cancelled`,
      tenant: cancelled,
    });
  } catch (err: any) {
    console.error('Error deleting tenant:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete tenant' }, { status: 500 });
  }
}
