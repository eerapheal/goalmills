import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import News from '@/models/News';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !hasPermission(session.user?.role, 'categories:manage')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const existing = await Category.findById(id);
    if (!existing) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (body.name && body.name !== existing.name) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: body.name.trim(),
      });
      if (duplicate) {
        return NextResponse.json(
          { message: 'A category with this name already exists' },
          { status: 400 }
        );
      }
    }

    if (body.slug) {
      body.slug = body.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-');
    }

    const updated = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error updating category' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !hasPermission(session.user?.role, 'categories:manage')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Check how many news articles use this category
    const newsCount = await News.countDocuments({ category: category.name });

    await Category.findByIdAndDelete(id);
    return NextResponse.json({
      message: `Category "${category.name}" deleted successfully`,
      associatedNewsCount: newsCount,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}
