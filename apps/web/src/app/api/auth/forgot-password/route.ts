import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Please provide an email address' },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Return success with generic message for privacy / security
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    // Generate random 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been generated successfully.',
      resetToken: token,
      resetUrl: `/reset-password?token=${token}`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
