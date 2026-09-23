import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized: Session required' }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, 'articles:draft') && userRole !== 'user') {
    // If hasPermission or any editorial role
  }
  // Allow all editorial roles: contributor, staff, editor, manager, super-admin
  if (!['contributor', 'staff', 'editor', 'manager', 'super-admin'].includes(userRole)) {
    return NextResponse.json(
      { message: `Forbidden: Role ${userRole} cannot upload media` },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try streaming upload to Cloudinary
    let secureUrl: string | null = null;
    try {
      const result = (await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'goalmills',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      })) as any;

      secureUrl = result?.secure_url || null;
    } catch (streamErr: any) {
      console.warn('Cloudinary stream upload error, attempting base64 fallback:', streamErr.message);

      // 2. Fallback: Base64 data URI upload
      try {
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'goalmills',
          resource_type: 'auto',
        });
        secureUrl = result?.secure_url || null;
      } catch (fallbackErr: any) {
        console.error('Cloudinary fallback upload failed:', fallbackErr.message);
        throw new Error(fallbackErr.message || 'Cloudinary upload failed');
      }
    }

    if (!secureUrl) {
      return NextResponse.json({ message: 'Cloudinary did not return a secure URL' }, { status: 500 });
    }

    return NextResponse.json({ url: secureUrl });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { message: error.message || 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
