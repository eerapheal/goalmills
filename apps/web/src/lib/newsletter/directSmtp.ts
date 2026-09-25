import nodemailer, { type Transporter, type SendMailOptions } from 'nodemailer';

export interface DirectSmtpOptions {
  to: string;
  subject: string;
  htmlBody: string;
  fromEmail?: string;
  fromName?: string;
  unsubscribeUrl?: string;
}

let transporterInstance: Transporter | null = null;

/**
 * Returns a pooled singleton nodemailer transporter configured for Gmail / SMTP relay.
 */
export function getNodemailerTransporter(): Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt((process.env.SMTP_PORT || '465').trim(), 10);
  const user = (process.env.SMTP_USER || 'hayeswaya@gmail.com').trim();
  const pass = (process.env.SMTP_PASSWORD || 'exkgjtzxxseenzug').trim();

  const isGmail = host.toLowerCase().includes('gmail');

  if (isGmail) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  } else {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporterInstance;
}

/**
 * Enterprise Nodemailer email dispatcher.
 * Delivers directly to recipients with full RFC 5321/5322 compliance and connection pooling.
 */
export async function sendEmailViaNodemailer(
  options: DirectSmtpOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const user = (process.env.SMTP_USER || 'hayeswaya@gmail.com').trim();
    const fromEmail = (options.fromEmail || process.env.SMTP_FROM_EMAIL || user).trim();
    const fromName = (
      options.fromName ||
      process.env.SMTP_FROM_NAME ||
      'GoalMills Sports Media'
    ).trim();

    const transporter = getNodemailerTransporter();

    const mailOptions: SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.htmlBody,
      headers: options.unsubscribeUrl
        ? {
            'List-Unsubscribe': `<${options.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'X-Mailer': 'GoalMills-Nodemailer/2.0',
          }
        : {
            'X-Mailer': 'GoalMills-Nodemailer/2.0',
          },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Nodemailer] Email successfully delivered to ${options.to} (Message-ID: ${info.messageId})`
    );
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Nodemailer Error] Failed to deliver to ${options.to}:`, err.message || err);
    return { success: false, error: err.message || 'Unknown nodemailer error' };
  }
}

// Backward compatibility alias for existing dispatcher calls
export const sendEmailViaDirectSmtp = sendEmailViaNodemailer;
