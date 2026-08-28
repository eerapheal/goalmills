import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'md';

    const filePath = path.join(
      process.cwd(),
      'public',
      'downloads',
      'GoalMills_Sports_Media_Training_Handbook_2026.md'
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'Handbook file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (format === 'txt') {
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="GoalMills_Sports_Media_Training_Handbook_2026.txt"',
        },
      });
    }

    // Default markdown download
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="GoalMills_Sports_Media_Training_Handbook_2026.md"',
      },
    });
  } catch (error: any) {
    console.error('Error serving handbook download:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
