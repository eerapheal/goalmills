import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission } from '@/lib/rbac';
import { isValidObjectId, SECURITY_HEADERS } from '@/lib/security';
import { UserRole } from '@goalmills/types';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// GoalMills Brand Colors
const NAVY = rgb(11 / 255, 18 / 255, 32 / 255);
const GOLD = rgb(245 / 255, 158 / 255, 11 / 255);
const WHITE = rgb(1, 1, 1);
const DARK = rgb(20 / 255, 30 / 255, 45 / 255);
const MUTED = rgb(100 / 255, 116 / 255, 139 / 255);
const BORDER_LIGHT = rgb(226 / 255, 232 / 255, 240 / 255);
const GREEN = rgb(16 / 255, 185 / 255, 129 / 255);

interface Fonts {
  bold: any;
  regular: any;
  oblique: any;
}

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid employee ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    const employee = await Employee.findOne({
      $or: [{ _id: id }, { userId: id }],
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Permission check: Manager/Super-admin or self employee
    const userRole = session.user.role as UserRole;
    const isManagerOrAdmin = hasPermission(userRole, 'employees:read');
    const isSelf =
      (employee.userId && employee.userId.toString() === session.user.id) ||
      (employee.email &&
        session.user.email &&
        employee.email.trim().toLowerCase() === session.user.email.trim().toLowerCase()) ||
      (employee._id.toString() === id && session.user.role !== 'user');

    if (!isManagerOrAdmin && !isSelf) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: You are not authorized to view or download another staff member's appointment letter.",
        },
        { status: 403 }
      );
    }

    // Build appointment data (same as the GET route in appointment/route.ts)
    const data = {
      companyName: 'GOALMILLS',
      companyPhone: '+2347084988228',
      companyEmail: 'support@goalmills.com',
      companyWebsite: 'https://goalmills-web.vercel.app',
      date: '27 August 2026',
      candidateName: employee.fullName,
      candidateAddress: employee.address || 'N/A',
      candidateEmail: employee.email || 'N/A',
      candidatePhone: employee.phone || 'N/A',
      position: employee.jobTitle || 'Sports Media & Social Media Content Officer',
      department: employee.department || 'Editorial & Digital Media',
      startDate: employee.startDate || '1 September 2026',
      trainingPeriod: `${employee.startDate || '1 September 2026'} - ${employee.trainingEndDate || '30 September 2026'}`,
      workArrangement: employee.workArrangement || 'Remote',
      reportsTo: employee.reportsTo || 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
      trainingSalary: employee.trainingAllowance || 30000,
      startingSalary: employee.startingSalary || 50000,
      founderName: 'Ekpenisi Erue Raphael',
      founderPosition: 'Founder',
      founderSignatureDate: '27/08/2026',
      employeeSignature: employee.employeeSignature || null,
      employeeSignatureDate: employee.appointmentSignedAt || null,
      isAccepted: employee.appointmentSigned || false,
    };

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fonts: Fonts = { bold: fontBold, regular: fontRegular, oblique: fontOblique };

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT;

    // Helper: add new page with running header/footer
    function newPage() {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT;
      // Header
      page.drawText('GOALMILLS  |  EMPLOYMENT & TRAINING APPOINTMENT LETTER', {
        x: MARGIN,
        y: PAGE_HEIGHT - 32,
        size: 7,
        font: fontBold,
        color: MUTED,
      });
      page.drawLine({
        start: { x: MARGIN, y: PAGE_HEIGHT - 38 },
        end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 38 },
        thickness: 0.5,
        color: BORDER_LIGHT,
      });
      // Footer
      const pn = pdfDoc.getPageCount();
      page.drawText(`Page ${pn}  |  GoalMills Sports Media Group (c) 2026  |  Confidential`, {
        x: MARGIN,
        y: 28,
        size: 7,
        font: fontRegular,
        color: MUTED,
      });
      y = PAGE_HEIGHT - 55;
    }

    function ensureSpace(need: number) {
      if (y - need < 55) newPage();
    }

    function drawLine(yPos: number, color = BORDER_LIGHT, thickness = 0.5) {
      page.drawLine({
        start: { x: MARGIN, y: yPos },
        end: { x: PAGE_WIDTH - MARGIN, y: yPos },
        thickness,
        color,
      });
    }

    function drawWrapped(
      text: string,
      size: number,
      font: any,
      color: any,
      indent = 0,
      lineHeight = 14
    ) {
      const lines = wrapText(text, CONTENT_WIDTH - indent, font, size);
      for (const line of lines) {
        ensureSpace(lineHeight);
        page.drawText(line, { x: MARGIN + indent, y, size, font, color });
        y -= lineHeight;
      }
    }

    function drawClauseTitle(title: string) {
      ensureSpace(28);
      y -= 6;
      // Gold accent bar
      page.drawRectangle({ x: MARGIN, y: y - 1, width: 4, height: 14, color: GOLD });
      page.drawText(title, { x: MARGIN + 10, y, size: 11, font: fontBold, color: DARK });
      y -= 20;
    }

    function drawBullet(text: string, indent = 14) {
      const lines = wrapText(text, CONTENT_WIDTH - indent - 6, fontRegular, 9.5);
      ensureSpace(lines.length * 13 + 2);
      page.drawText('•', {
        x: MARGIN + indent - 8,
        y: y + 1,
        size: 8,
        font: fontBold,
        color: GOLD,
      });
      for (const line of lines) {
        page.drawText(line, { x: MARGIN + indent, y, size: 9.5, font: fontRegular, color: DARK });
        y -= 13;
      }
    }

    // ==========================================
    // PAGE 1: LETTERHEAD & TOP
    // ==========================================

    // Dark Navy header band
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 130, width: PAGE_WIDTH, height: 130, color: NAVY });

    // Company name
    page.drawText('GOALMILLS', {
      x: MARGIN,
      y: PAGE_HEIGHT - 45,
      size: 30,
      font: fontBold,
      color: WHITE,
    });

    // Contact info
    page.drawText(`${data.companyPhone}  |  ${data.companyEmail}  |  ${data.companyWebsite}`, {
      x: MARGIN,
      y: PAGE_HEIGHT - 65,
      size: 8,
      font: fontRegular,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });

    // Title badge
    const badgeText = 'EMPLOYMENT & TRAINING APPOINTMENT LETTER';
    const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 9) + 24;
    const badgeX = (PAGE_WIDTH - badgeWidth) / 2;
    page.drawRectangle({
      x: badgeX,
      y: PAGE_HEIGHT - 100,
      width: badgeWidth,
      height: 22,
      color: rgb(255 / 255, 251 / 255, 235 / 255),
      borderColor: GOLD,
      borderWidth: 1,
    });
    page.drawText(badgeText, {
      x: badgeX + 12,
      y: PAGE_HEIGHT - 94,
      size: 9,
      font: fontBold,
      color: GOLD,
    });

    // Date
    const dateText = `Date: ${data.date}`;
    page.drawText(dateText, {
      x: PAGE_WIDTH - MARGIN - fontRegular.widthOfTextAtSize(dateText, 8),
      y: PAGE_HEIGHT - 120,
      size: 8,
      font: fontRegular,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });

    y = PAGE_HEIGHT - 150;

    // Footer on page 1
    page.drawText(`Page 1  |  GoalMills Sports Media Group (c) 2026  |  Confidential`, {
      x: MARGIN,
      y: 28,
      size: 7,
      font: fontRegular,
      color: MUTED,
    });

    // ---- Recipient Details Box ----
    ensureSpace(80);
    page.drawRectangle({
      x: MARGIN,
      y: y - 65,
      width: CONTENT_WIDTH,
      height: 72,
      color: rgb(248 / 255, 250 / 255, 252 / 255),
      borderColor: BORDER_LIGHT,
      borderWidth: 1,
    });

    page.drawText('TO:', { x: MARGIN + 10, y: y - 4, size: 8, font: fontBold, color: MUTED });
    page.drawText(data.candidateName, {
      x: MARGIN + 10,
      y: y - 18,
      size: 12,
      font: fontBold,
      color: DARK,
    });
    page.drawText(`Address: ${data.candidateAddress}`, {
      x: MARGIN + 10,
      y: y - 32,
      size: 9,
      font: fontRegular,
      color: rgb(71 / 255, 85 / 255, 105 / 255),
    });
    page.drawText(`Email: ${data.candidateEmail}`, {
      x: MARGIN + 10,
      y: y - 44,
      size: 9,
      font: fontRegular,
      color: rgb(71 / 255, 85 / 255, 105 / 255),
    });
    page.drawText(`Phone: ${data.candidatePhone}`, {
      x: MARGIN + 10,
      y: y - 56,
      size: 9,
      font: fontRegular,
      color: rgb(71 / 255, 85 / 255, 105 / 255),
    });
    y -= 80;

    // ---- Salutation & Opening ----
    y -= 8;
    page.drawText(`Employment Appointment - ${data.position}`, {
      x: MARGIN,
      y,
      size: 12,
      font: fontBold,
      color: GOLD,
    });
    y -= 22;

    drawWrapped(`Dear ${data.candidateName},`, 10, fontRegular, DARK);
    y -= 6;
    drawWrapped(
      `We are pleased to offer you an appointment with GoalMills as a ${data.position}, effective ${data.startDate}.`,
      10,
      fontRegular,
      DARK
    );
    y -= 4;
    drawWrapped(
      'This appointment is intended to develop you into a capable member of the GoalMills sports media and digital publishing team. Your role will combine structured training with practical daily responsibilities in sports journalism, content creation, social media management, audience engagement, graphics, publishing, and digital audience growth.',
      10,
      fontRegular,
      DARK
    );
    y -= 4;
    drawWrapped(
      'Your employment will begin with a structured 30-day GoalMills Sports Media Training Programme, during which you will learn and immediately apply the skills required for your position.',
      10,
      fontRegular,
      DARK
    );

    // ==========================================
    // CLAUSES
    // ==========================================
    y -= 8;
    drawLine(y, BORDER_LIGHT, 0.5);
    y -= 8;

    // Clause 1 - POSITION
    drawClauseTitle('1. POSITION');
    drawBullet(`Job Title: ${data.position}`);
    drawBullet(`Department: ${data.department}`);
    drawBullet(`Employment Start Date: ${data.startDate}`);
    drawBullet(`Initial Training Period: ${data.trainingPeriod}`);
    drawBullet(`Work Arrangement: ${data.workArrangement}`);
    drawBullet(`Reports To: ${data.reportsTo}`);
    drawBullet('Primary Platform: GoalMills website and official social media platforms');

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 2 - TRAINING PERIOD
    drawClauseTitle('2. TRAINING PERIOD');
    drawWrapped(
      'Your first month will be a structured 30-day practical training and onboarding period designed around:',
      9.5,
      fontRegular,
      DARK
    );
    y -= 4;
    // Training model box
    ensureSpace(24);
    page.drawRectangle({
      x: MARGIN + 20,
      y: y - 6,
      width: CONTENT_WIDTH - 40,
      height: 22,
      color: rgb(255 / 255, 251 / 255, 235 / 255),
      borderColor: GOLD,
      borderWidth: 1,
    });
    const modelText = 'Learn -> Create -> Publish -> Submit -> Review -> Improve';
    const modelWidth = fontBold.widthOfTextAtSize(modelText, 9);
    page.drawText(modelText, {
      x: MARGIN + 20 + (CONTENT_WIDTH - 40 - modelWidth) / 2,
      y: y - 0,
      size: 9,
      font: fontBold,
      color: rgb(180 / 255, 120 / 255, 0 / 255),
    });
    y -= 28;

    drawWrapped(
      'The training covers: Sports article writing, Sports research & Fact-checking, Journalism & editorial standards, SEO, Content planning, Breaking-news coverage, Matchday coverage, Social media, Community management, Canva graphic design, Short-form video (Reels, TikTok, Shorts), YouTube, Facebook, X, Audience growth, Analytics, Content repurposing, and GoalMills newsroom operations.',
      9,
      fontRegular,
      rgb(71 / 255, 85 / 255, 105 / 255)
    );

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 3 - TRAINING COMPENSATION
    drawClauseTitle('3. TRAINING COMPENSATION');
    drawWrapped(
      `For the initial 30-day training period: Training Salary: N${data.trainingSalary.toLocaleString()}. This amount will be paid for the first month of training. The training period is paid employment and not an unpaid internship.`,
      9.5,
      fontRegular,
      DARK
    );

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 4 - STARTING SALARY
    drawClauseTitle('4. STARTING SALARY AFTER TRAINING');
    drawWrapped(
      `Following successful completion of the initial training period, your starting salary will be: N${data.startingSalary.toLocaleString()} per month.`,
      9.5,
      fontRegular,
      DARK
    );

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 5 - FUTURE SALARY REVIEW
    drawClauseTitle('5. FUTURE SALARY REVIEW');
    drawWrapped(
      'GoalMills is an early-stage sports media business. Once GoalMills begins generating sustainable revenue through advertising, sponsorships, partnerships, and monetization, management intends to review employee compensation and renegotiate the salary accordingly.',
      9.5,
      fontRegular,
      DARK
    );

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 16 - DAILY REPORTING
    drawClauseTitle('16. DAILY REPORTING & STAND-UP');
    drawWrapped(
      'At the end of each working day, you must submit your daily content report including published articles, social posts, Canva graphics, video links, sources, problems encountered, and lessons learned.',
      9.5,
      fontRegular,
      DARK
    );
    y -= 4;
    drawWrapped(
      'You are required to attend the GoalMills daily newsroom stand-up from 5:00 PM - 5:30 PM West Africa Time (WAT) on Google Meet.',
      9.5,
      fontRegular,
      DARK
    );

    y -= 4;
    drawLine(y, BORDER_LIGHT, 0.3);
    y -= 4;

    // Clause 18 - PERFORMANCE EVALUATION
    drawClauseTitle('18. 100% WEIGHTED PERFORMANCE EVALUATION');

    const metrics = [
      { name: 'Journalism', weight: '15%' },
      { name: 'Writing', weight: '15%' },
      { name: 'Research', weight: '15%' },
      { name: 'SEO', weight: '10%' },
      { name: 'Social Media', weight: '10%' },
      { name: 'Canva Design', weight: '10%' },
      { name: 'Video', weight: '10%' },
      { name: 'Discipline', weight: '5%' },
      { name: 'Analytics', weight: '5%' },
      { name: 'Teamwork', weight: '5%' },
    ];

    ensureSpace(50);
    const cellW = (CONTENT_WIDTH - 10) / 5;
    const cellH = 32;
    for (let i = 0; i < metrics.length; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const cx = MARGIN + 5 + col * cellW;
      const cy = y - row * (cellH + 4);

      page.drawRectangle({
        x: cx,
        y: cy - cellH + 8,
        width: cellW - 4,
        height: cellH,
        color: rgb(248 / 255, 250 / 255, 252 / 255),
        borderColor: BORDER_LIGHT,
        borderWidth: 0.5,
      });
      const nameWidth = fontBold.widthOfTextAtSize(metrics[i].name, 8);
      page.drawText(metrics[i].name, {
        x: cx + (cellW - 4 - nameWidth) / 2,
        y: cy - 4,
        size: 8,
        font: fontBold,
        color: DARK,
      });
      const weightWidth = fontBold.widthOfTextAtSize(metrics[i].weight, 10);
      page.drawText(metrics[i].weight, {
        x: cx + (cellW - 4 - weightWidth) / 2,
        y: cy - 18,
        size: 10,
        font: fontBold,
        color: GOLD,
      });
    }
    y -= 2 * (cellH + 4) + 12;

    // ==========================================
    // SIGNATURES SECTION
    // ==========================================
    y -= 4;
    drawLine(y, GOLD, 1.5);
    y -= 20;

    ensureSpace(120);

    // Company Signature (left side)
    const sigColW = CONTENT_WIDTH / 2 - 10;

    page.drawText('FOR GOALMILLS', {
      x: MARGIN,
      y,
      size: 9,
      font: fontBold,
      color: GOLD,
    });
    y -= 16;
    page.drawText(`Name: ${data.founderName}`, {
      x: MARGIN,
      y,
      size: 9.5,
      font: fontRegular,
      color: DARK,
    });
    y -= 14;
    page.drawText(`Position: ${data.founderPosition}`, {
      x: MARGIN,
      y,
      size: 9.5,
      font: fontRegular,
      color: DARK,
    });
    y -= 18;
    // Founder signature (italic)
    page.drawText(data.founderName, {
      x: MARGIN,
      y,
      size: 14,
      font: fontOblique,
      color: GREEN,
    });
    y -= 16;
    page.drawText(`Date: ${data.founderSignatureDate}`, {
      x: MARGIN,
      y,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });

    // Employee Signature (right side)
    const empSigX = MARGIN + sigColW + 20;
    let empY = y + 14 + 16 + 18 + 16; // reset to same starting Y

    page.drawText('EMPLOYEE ACKNOWLEDGEMENT & ACCEPTANCE', {
      x: empSigX,
      y: empY,
      size: 9,
      font: fontBold,
      color: rgb(59 / 255, 130 / 255, 246 / 255),
    });
    empY -= 16;
    page.drawText(`Name: ${data.candidateName}`, {
      x: empSigX,
      y: empY,
      size: 9.5,
      font: fontRegular,
      color: DARK,
    });
    empY -= 14;

    if (data.isAccepted && data.employeeSignature) {
      page.drawText(`Position: ${data.position}`, {
        x: empSigX,
        y: empY,
        size: 9.5,
        font: fontRegular,
        color: DARK,
      });
      empY -= 18;
      page.drawText(data.employeeSignature, {
        x: empSigX,
        y: empY,
        size: 14,
        font: fontOblique,
        color: GREEN,
      });
      empY -= 16;
      page.drawText(`Digitally Signed on ${data.employeeSignatureDate}`, {
        x: empSigX,
        y: empY,
        size: 8,
        font: fontBold,
        color: GREEN,
      });
    } else {
      page.drawText(`Position: ${data.position}`, {
        x: empSigX,
        y: empY,
        size: 9.5,
        font: fontRegular,
        color: DARK,
      });
      empY -= 18;
      // Signature line placeholder
      page.drawLine({
        start: { x: empSigX, y: empY },
        end: { x: empSigX + sigColW - 20, y: empY },
        thickness: 1,
        color: BORDER_LIGHT,
      });
      empY -= 14;
      page.drawText('Signature', {
        x: empSigX,
        y: empY,
        size: 8,
        font: fontOblique,
        color: MUTED,
      });
      empY -= 14;
      page.drawLine({
        start: { x: empSigX, y: empY },
        end: { x: empSigX + sigColW - 20, y: empY },
        thickness: 1,
        color: BORDER_LIGHT,
      });
      empY -= 14;
      page.drawText('Date', {
        x: empSigX,
        y: empY,
        size: 8,
        font: fontOblique,
        color: MUTED,
      });
    }

    // Generate PDF
    const pdfBytes = await pdfDoc.save();

    const safeName = data.candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `GOALMILLS-Appointment-Letter-${safeName}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating appointment PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate appointment PDF' },
      { status: 500 }
    );
  }
}
