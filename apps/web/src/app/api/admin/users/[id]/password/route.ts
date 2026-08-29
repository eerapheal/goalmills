import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import type { UserRole } from '@goalmills/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = (await getServerSession(authOptions)) as any;

    const userRole = (session?.user?.role as UserRole) || undefined;
    if (!session || !hasPermission(userRole, 'users:manage')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: User management permission required' },
        { status: 403 }
      );
    }

    const { newPassword } = await request.json();

    const plainPassword =
      newPassword && newPassword.length >= 6
        ? newPassword
        : `GM${Math.random().toString(36).substring(2, 7)}!2026`;

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.username}`,
      credentials: {
        email: user.email,
        username: user.username,
        newPassword: plainPassword,
      },
    });
  } catch (error: any) {
    console.error('Admin password reset error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
