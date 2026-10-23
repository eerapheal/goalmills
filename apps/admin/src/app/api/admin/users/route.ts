import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { escapeRegex } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || session.user?.role !== 'super-admin') {
    return NextResponse.json(
      { message: 'Unauthorized: Super Admin access required' },
      { status: 401 }
    );
  }

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role')?.trim();

    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      const safeRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ username: safeRegex }, { email: safeRegex }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
