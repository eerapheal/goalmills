import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const pdfPath = path.join(
      process.cwd(),
      'public',
      'downloads',
      'GOALMILLS-Training-Resources-&-Handbooks.pdf'
    );

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { success: false, message: 'Official PDF Handbook file not found' },
        { status: 404 }
      );
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="GOALMILLS-Training-Resources-&-Handbooks.pdf"',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving handbook PDF download:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
