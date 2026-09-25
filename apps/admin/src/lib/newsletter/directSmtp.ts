import net from 'net';
import tls from 'tls';

export interface DirectSmtpOptions {
  to: string;
  subject: string;
  htmlBody: string;
  fromEmail?: string;
  fromName?: string;
  unsubscribeUrl?: string;
}

function sendCommand(socket: net.Socket | tls.TLSSocket, cmd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (data: Buffer) => {
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
      resolve(data.toString());
    };
    const onError = (err: Error) => {
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
      reject(err);
    };
    socket.on('data', onData);
    socket.on('error', onError);

    if (cmd !== undefined) {
      socket.write(cmd + '\r\n');
    }
  });
}

/**
 * Enterprise direct SMTP email dispatcher.
 * Uses native Node.js net/tls sockets (zero dependencies) with RFC 5321/5322 compliance.
 * Works seamlessly with Gmail, AWS SES, SendGrid, Mailgun, and custom SMTP relays.
 */
export async function sendEmailViaDirectSmtp(
  options: DirectSmtpOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  const fromEmail = (options.fromEmail || process.env.SMTP_FROM_EMAIL || user).trim();
  const fromName = (
    options.fromName ||
    process.env.SMTP_FROM_NAME ||
    'GoalMills Sports Media'
  ).trim();

  if (!host || !user || !pass) {
    console.warn(
      '[Direct SMTP] Missing SMTP configuration in environment. Skipping email dispatch.'
    );
    return { success: false, error: 'SMTP configuration incomplete' };
  }

  return new Promise((resolve) => {
    const timeoutTimer = setTimeout(() => {
      resolve({ success: false, error: 'SMTP connection timeout after 10s' });
    }, 10_000);

    const cleanup = () => clearTimeout(timeoutTimer);

    try {
      const isDirectTls = port === 465;
      const connectSocket = () => {
        if (isDirectTls) {
          return tls.connect({ host, port, rejectUnauthorized: false });
        }
        return net.createConnection(port, host);
      };

      const plainSocket = connectSocket();

      plainSocket.once('error', (err) => {
        cleanup();
        console.error('[Direct SMTP] Initial socket error:', err.message);
        resolve({ success: false, error: err.message });
      });

      plainSocket.once('connect', async () => {
        try {
          let socket: net.Socket | tls.TLSSocket = plainSocket;

          // 1. Initial Greeting
          const greeting = await sendCommand(socket);
          if (!greeting.startsWith('220')) {
            cleanup();
            socket.end('QUIT\r\n');
            return resolve({
              success: false,
              error: `Invalid server greeting: ${greeting.trim()}`,
            });
          }

          // 2. EHLO
          let ehloRes = await sendCommand(socket, 'EHLO goalmills.com');

          // 3. STARTTLS upgrade if port 587
          if (!isDirectTls) {
            await sendCommand(socket, 'STARTTLS');
            socket = await new Promise<tls.TLSSocket>((resTls, rejTls) => {
              const tlsSock = tls.connect(
                {
                  socket: plainSocket,
                  host,
                  rejectUnauthorized: false,
                },
                () => resTls(tlsSock)
              );
              tlsSock.once('error', rejTls);
            });

            ehloRes = await sendCommand(socket, 'EHLO goalmills.com');
          }

          // 4. AUTH LOGIN
          await sendCommand(socket, 'AUTH LOGIN');
          await sendCommand(socket, Buffer.from(user).toString('base64'));
          const authRes = await sendCommand(socket, Buffer.from(pass).toString('base64'));

          if (!authRes.startsWith('235')) {
            cleanup();
            socket.end('QUIT\r\n');
            return resolve({
              success: false,
              error: `SMTP Authentication failed: ${authRes.trim()}`,
            });
          }

          // 5. MAIL FROM
          const mailFromRes = await sendCommand(socket, `MAIL FROM:<${fromEmail}>`);
          if (!mailFromRes.startsWith('250')) {
            cleanup();
            socket.end('QUIT\r\n');
            return resolve({ success: false, error: `MAIL FROM rejected: ${mailFromRes.trim()}` });
          }

          // 6. RCPT TO
          const rcptRes = await sendCommand(socket, `RCPT TO:<${options.to}>`);
          if (!rcptRes.startsWith('250') && !rcptRes.startsWith('251')) {
            cleanup();
            socket.end('QUIT\r\n');
            return resolve({ success: false, error: `Recipient rejected: ${rcptRes.trim()}` });
          }

          // 7. DATA
          const dataPrompt = await sendCommand(socket, 'DATA');
          if (!dataPrompt.startsWith('354')) {
            cleanup();
            socket.end('QUIT\r\n');
            return resolve({ success: false, error: `DATA prompt failed: ${dataPrompt.trim()}` });
          }

          // 8. Build RFC 5322 MIME message
          const messageId = `<gm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@goalmills.com>`;
          const headers = [
            `From: ${fromName} <${fromEmail}>`,
            `To: <${options.to}>`,
            `Subject: ${options.subject}`,
            `Date: ${new Date().toUTCString()}`,
            `Message-ID: ${messageId}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'X-Mailer: GoalMills-Enterprise-Mailer/2.0',
          ];

          if (options.unsubscribeUrl) {
            headers.push(`List-Unsubscribe: <${options.unsubscribeUrl}>`);
            headers.push('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
          }

          const rawEmail = `${headers.join('\r\n')}\r\n\r\n${options.htmlBody}\r\n.\r\n`;

          const sendResult = await sendCommand(socket, rawEmail.slice(0, -2));
          cleanup();

          socket.end('QUIT\r\n');

          if (sendResult.startsWith('250')) {
            console.log(
              `[Direct SMTP] Email successfully delivered to ${options.to} (Message-ID: ${messageId})`
            );
            return resolve({ success: true, messageId });
          } else {
            return resolve({ success: false, error: `Delivery error: ${sendResult.trim()}` });
          }
        } catch (err: any) {
          cleanup();
          console.error('[Direct SMTP] Execution error:', err.message);
          resolve({ success: false, error: err.message });
        }
      });
    } catch (err: any) {
      cleanup();
      console.error('[Direct SMTP] Fatal error:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}
