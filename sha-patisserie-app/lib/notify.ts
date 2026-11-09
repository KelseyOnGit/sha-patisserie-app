import { Resend } from 'resend';

interface ShiftItem {
  startTime: Date | string;
  endTime: Date | string;
}

/**
 * Formats published weekly shifts into HTML content for the staff email body.
 */
export function buildRosterMessage(
  name: string | null,
  shifts: ShiftItem[]
): string {
  if (!shifts || shifts.length === 0) {
    return `<p>Hi ${name || 'Team Member'},</p><p>You have no shifts scheduled for this week.</p>`;
  }

  const shiftRows = [...shifts]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);

      const dayStr = start.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        timeZone: 'Australia/Perth',
      });

      const startTimeStr = start.toLocaleTimeString('en-AU', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Australia/Perth',
      });

      const endTimeStr = end.toLocaleTimeString('en-AU', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Australia/Perth',
      });

      return `
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 10px; font-weight: bold;">${dayStr}</td>
          <td style="padding: 10px;">${startTimeStr} - ${endTimeStr}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
      <h2 style="font-family: serif;">Hi ${name || 'Team Member'},</h2>
      <p>Here is your published work schedule for this week:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 16px;">
        <thead>
          <tr style="background-color: #f5f5f4; text-transform: uppercase; font-size: 12px; color: #78716c;">
            <th style="padding: 10px;">Day & Date</th>
            <th style="padding: 10px;">Shift Time</th>
          </tr>
        </thead>
        <tbody>
          ${shiftRows}
        </tbody>
      </table>

      <p style="margin-top: 24px; font-size: 13px; color: #78716c;">
        Please log into the staff portal if you need to request shift changes or swaps.
      </p>
    </div>
  `;
}

/**
 * Sends an email using Resend and returns an object matching your POST route expectations:
 * { sent: boolean, reason?: string }
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlMessage: string,
  options?: { idempotencyKey: string },
): Promise<{ sent: boolean; reason?: string; id?: string }> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return { sent: false, reason: 'RESEND_API_KEY is not configured.' };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim() || 'onboarding@resend.dev',
      to,
      subject,
      html: htmlMessage,
    }, options);

    if (error) {
      return { sent: false, reason: error.message };
    }

    return { sent: true, ...(data?.id ? { id: data.id } : {}) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email dispatch error';
    return { sent: false, reason: message };
  }
}