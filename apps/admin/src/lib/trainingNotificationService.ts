import dbConnect from './db';
import Notification from '../models/Notification';
import PushToken from '../models/PushToken';
import { sendPushNotification } from './pushService';

export interface GradedReportNotificationParams {
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  trainingDay: number;
  lessonStudied: string;
  reportDate: string;
  totalScore: number;
  performanceRating: string;
  reviewStatus: 'approved' | 'revision' | 'retraining' | 'reviewed' | 'pending';
  scorecard: {
    research: number;
    accuracy: number;
    writing: number;
    seo: number;
    socialMedia: number;
    graphicDesign: number;
    creativity: number;
    publishingDiscipline: number;
    analyticsLearning: number;
    teamworkReporting: number;
  };
  editorFeedback: string;
  reviewedBy: string;
}

/**
 * Generate responsive HTML email for daily graded sports media academy assignment
 */
export function generateGradedEmailHTML(params: GradedReportNotificationParams): string {
  const {
    employeeName,
    trainingDay,
    lessonStudied,
    reportDate,
    totalScore,
    performanceRating,
    reviewStatus,
    scorecard,
    editorFeedback,
    reviewedBy,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goalmills-web.vercel.app';
  const statusColor =
    reviewStatus === 'approved' ? '#10b981' : reviewStatus === 'revision' ? '#f59e0b' : '#ef4444';
  const statusLabel =
    reviewStatus === 'approved'
      ? '✓ Approved'
      : reviewStatus === 'revision'
      ? '⚠️ Needs Revision'
      : '❌ Remedial Training';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoalMills Daily Report Graded</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
    
    <!-- Brand Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #001f3f, #0a2540); border: 1px solid rgba(255,215,0,0.3); border-radius: 12px; margin-bottom: 12px;">
        <span style="color: #ffd700; font-weight: 900; font-size: 18px; letter-spacing: 1px;">GOALMILLS</span>
        <span style="color: #94a3b8; font-size: 12px; margin-left: 6px; text-transform: uppercase;">Sports Media Academy</span>
      </div>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">Daily Assignment Scorecard</h1>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Training Day ${trainingDay} • ${reportDate}</p>
    </div>

    <!-- Candidate Greeting & Overall Result Card -->
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1;">Dear <strong>${employeeName}</strong>,</p>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
        Your submission for <strong>Day ${trainingDay}: ${lessonStudied}</strong> has been officially evaluated and scored by the editorial management team.
      </p>

      <div style="display: flex; align-items: center; justify-content: space-between; background: #070d19; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <div>
          <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px;">Overall Score</span>
          <span style="font-size: 28px; font-weight: 900; color: #ffd700;">${totalScore}<span style="font-size: 16px; color: #64748b;">/100</span></span>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40; font-weight: 800; font-size: 12px; text-transform: uppercase;">
            ${statusLabel}
          </span>
          <span style="display: block; font-size: 12px; color: #cbd5e1; font-weight: 600; margin-top: 4px;">Rating: ${performanceRating}</span>
        </div>
      </div>
    </div>

    <!-- 10-Category Breakdown Table -->
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
        📊 10-Category Performance Breakdown
      </h3>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #64748b; text-align: left;">
            <th style="padding: 8px 4px;">Competency Category</th>
            <th style="padding: 8px 4px; text-align: right;">Score</th>
            <th style="padding: 8px 4px; text-align: right;">Max</th>
          </tr>
        </thead>
        <tbody style="color: #cbd5e1;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Sports Research & Verification</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.research ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">15</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Factual Accuracy & Integrity</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.accuracy ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">15</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Article Writing Quality</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.writing ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">15</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">SEO & Metadata Optimization</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.seo ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">10</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Social Media Packaging</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.socialMedia ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">10</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Canva Graphic & Visual Design</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.graphicDesign ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">10</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Editorial Creativity & Hooks</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.creativity ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">10</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Publishing Discipline & Deadline</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.publishingDiscipline ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">5</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 8px 4px;">Analytics & Learning Awareness</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.analyticsLearning ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">5</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 8px 4px;">Teamwork & Standup Participation</td>
            <td style="padding: 8px 4px; text-align: right; font-weight: 700; color: #ffd700;">${scorecard?.teamworkReporting ?? 0}</td>
            <td style="padding: 8px 4px; text-align: right; color: #64748b;">5</td>
          </tr>
          <tr style="font-weight: 800; font-size: 13px; color: #ffffff;">
            <td style="padding: 10px 4px;">TOTAL SCORE</td>
            <td style="padding: 10px 4px; text-align: right; color: #ffd700;">${totalScore}</td>
            <td style="padding: 10px 4px; text-align: right; color: #64748b;">100</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editorial Feedback -->
    ${
      editorFeedback
        ? `
    <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #ffd700; text-transform: uppercase; letter-spacing: 0.5px;">
        ✍️ Managing Editor Notes & Next-Day Priorities
      </h3>
      <p style="margin: 0; font-size: 13px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">
        ${editorFeedback}
      </p>
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
        Evaluated by: <strong>${reviewedBy}</strong>
      </p>
    </div>`
        : ''
    }

    <!-- Call to action button -->
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${siteUrl}/portal" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #050b14; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
        Open Staff Workspace & Action Next Day
      </a>
    </div>

    <!-- Footer note -->
    <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 11px; color: #475569;">
      <p style="margin: 0 0 4px 0;">GoalMills Sports Media Academy • 30-Day Mandatory Employee Curriculum</p>
      <p style="margin: 0;">Daily Stand-Up: 5:00 PM – 5:30 PM WAT on Google Meet</p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Dispatches multi-channel graded assignment notifications across Email, Dashboard, and Push
 */
export async function notifyStaffGradedAssignment(params: GradedReportNotificationParams) {
  await dbConnect();

  const {
    employeeId,
    employeeName,
    employeeEmail,
    trainingDay,
    totalScore,
    performanceRating,
    reviewStatus,
    editorFeedback,
  } = params;

  const results: {
    dashboardNotificationId?: string;
    pushSuccess: boolean;
    emailSent: boolean;
  } = {
    pushSuccess: false,
    emailSent: false,
  };

  const statusLabel =
    reviewStatus === 'approved'
      ? 'Approved'
      : reviewStatus === 'revision'
      ? 'Revision Required'
      : 'Retraining';

  const title = `📝 Day ${trainingDay} Graded: ${totalScore}/100 (${statusLabel})`;
  const body = `Your Day ${trainingDay} submission scored ${totalScore}/100 (${performanceRating}). Feedback: ${
    editorFeedback ? editorFeedback.slice(0, 100) + '...' : 'Check scorecard details in portal.'
  }`;

  // 1. DASHBOARD NOTIFICATION (In-app database record)
  try {
    const notif = await Notification.create({
      title,
      body,
      topic: `staff_${employeeId}`,
      targetPlatform: 'all',
      data: {
        type: 'training_report_graded',
        employeeId,
        trainingDay,
        totalScore,
        performanceRating,
        reviewStatus,
        url: '/portal',
      },
      deliveryStats: { totalSent: 1, successCount: 1, failureCount: 0 },
    });
    results.dashboardNotificationId = notif._id.toString();
  } catch (dbErr) {
    console.error('[NotificationService] Failed to save in-app notification:', dbErr);
  }

  // 2. PUSH NOTIFICATION (Expo / FCM / Web)
  try {
    const pushRes = await sendPushNotification({
      title,
      body,
      topic: `staff_${employeeId}`,
      targetPlatform: 'all',
      data: {
        type: 'training_report_graded',
        employeeId,
        trainingDay,
        totalScore,
        performanceRating,
        reviewStatus,
        url: '/portal',
      },
    });
    results.pushSuccess = pushRes.success;
  } catch (pushErr) {
    console.error('[NotificationService] Push notification dispatch error:', pushErr);
  }

  // 3. EMAIL NOTIFICATION (Go Mailer or Transactional Queue)
  if (employeeEmail) {
    try {
      const mailerServiceUrl = process.env.MAILER_SERVICE_URL || 'https://goalmills.onrender.com';
      const htmlContent = generateGradedEmailHTML(params);

      const mailPayload = {
        campaignId: `training_grade_day_${trainingDay}_${Date.now()}`,
        subject: `[GoalMills Academy] Day ${trainingDay} Graded: ${totalScore}/100 (${statusLabel})`,
        previewText: `Your Day ${trainingDay} sports media assignment was graded ${totalScore}/100.`,
        frequency: 'transactional',
        isHighPriority: true,
        articles: [],
        recipients: [
          {
            email: employeeEmail.toLowerCase(),
            recipientId: employeeId,
          },
        ],
        customHtml: htmlContent,
      };

      const res = await fetch(`${mailerServiceUrl}/api/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailPayload),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        results.emailSent = true;
      } else {
        console.warn('[NotificationService] Mailer service response not ok:', res.status);
      }
    } catch (mailErr) {
      // Gracefully handled if mailer service is local or offline
      console.warn('[NotificationService] Email dispatch handled with fallback log:', mailErr);
    }
  }

  return results;
}
