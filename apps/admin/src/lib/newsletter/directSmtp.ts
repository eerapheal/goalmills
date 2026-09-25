import nodemailer, { type Transporter, type SendMailOptions } from 'nodemailer';

export interface DirectSmtpOptions {
  to: string;
  subject: string;
  htmlBody: string;
  fromEmail?: string;
  fromName?: string;
  unsubscribeUrl?: string;
  replyTo?: string;
}

let transporterInstance: Transporter | null = null;

/**
 * Returns a pooled singleton Nodemailer transporter.
 * For Gmail: uses `service: 'gmail'` which auto-resolves host/port/TLS.
 * For other SMTP: reads SMTP_HOST, SMTP_PORT from env.
 */
export function getNodemailerTransporter(): Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();

  if (!user || !pass) {
    console.error('[Nodemailer] SMTP_USER or SMTP_PASSWORD not set. Email delivery will fail.');
  }

  const isGmail = host.toLowerCase().includes('gmail');

  if (isGmail) {
    // Gmail: `service: 'gmail'` handles host/port/TLS automatically
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 5,
    });
  } else {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporterInstance;
}

/**
 * Reset the cached transporter (e.g. after auth errors).
 */
export function resetTransporter(): void {
  if (transporterInstance) {
    try {
      transporterInstance.close();
    } catch (_) {
      // ignore close errors
    }
    transporterInstance = null;
  }
}

/**
 * Strip HTML tags for plain-text fallback (improves deliverability score).
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Nodemailer email dispatcher with retry logic.
 * Includes plain-text fallback and RFC 8058 one-click unsubscribe headers.
 */
export async function sendEmailViaNodemailer(
  options: DirectSmtpOptions,
  maxRetries = 2
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const user = (process.env.SMTP_USER || '').trim();
  const fromEmail = (options.fromEmail || process.env.SMTP_FROM_EMAIL || user).trim();
  const fromName = (
    options.fromName ||
    process.env.SMTP_FROM_NAME ||
    'GoalMills Sports Media'
  ).trim();

  if (!user) {
    return { success: false, error: 'SMTP_USER is not configured' };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = getNodemailerTransporter();

      const mailOptions: SendMailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.htmlBody,
        text: htmlToPlainText(options.htmlBody),
        headers: {
          'X-Mailer': 'GoalMills-Nodemailer/3.0',
          ...(options.unsubscribeUrl
            ? {
                'List-Unsubscribe': `<${options.unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              }
            : {}),
        },
      };

      if (options.replyTo) {
        mailOptions.replyTo = options.replyTo;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[Nodemailer] ✓ Delivered to ${options.to} (Message-ID: ${info.messageId}, Attempt: ${attempt})`
      );
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown nodemailer error';
      console.error(
        `[Nodemailer] ✗ Attempt ${attempt}/${maxRetries} failed for ${options.to}: ${errorMsg}`
      );

      // On auth errors, reset the transporter so next attempt creates a fresh connection
      if (
        errorMsg.includes('Invalid login') ||
        errorMsg.includes('auth') ||
        errorMsg.includes('535') ||
        errorMsg.includes('ECONNREFUSED')
      ) {
        resetTransporter();
      }

      if (attempt === maxRetries) {
        return { success: false, error: errorMsg };
      }

      // Brief delay before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Backward compatibility alias
export const sendEmailViaDirectSmtp = sendEmailViaNodemailer;
