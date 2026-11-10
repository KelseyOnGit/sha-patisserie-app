import { sendEmail } from '@/lib/notify';
import { formatDMY } from '@/lib/date-format';
import { LEAVE_LABELS, leaveDate } from '@/lib/leave';

export interface LeaveNotification {
  event: 'requested' | 'changed' | 'cancellation';
  requestId: string;
  staffName: string | null;
  type: string;
  dates: string[];
  totalHours: string;
  note: string;
}

export interface MissedClockInNotification {
  userId: string;
  name: string | null;
  scheduledStart: Date | string;
  minutesLate: number;
}

export interface MissedClockOutNotification {
  userId: string;
  name: string | null;
  scheduledEnd: Date | string;
}

export interface PendingRegistrationNotification {
  userId: string;
  name: string | null;
  email: string;
  registeredAt: Date | string;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

export function leaveDateRanges(values: string[]): string {
  const dates = [...new Set(values)].sort();
  if (!dates.length) throw new Error('Leave notification requires at least one date.');
  dates.forEach(leaveDate);
  const ranges: string[] = [];
  let start = dates[0];
  let end = start;
  const append = () => ranges.push(start === end ? formatDMY(start) : `${formatDMY(start)} to ${formatDMY(end)}`);
  for (const date of dates.slice(1)) {
    if (Date.parse(date) - Date.parse(end) === 86400000) {
      end = date;
    } else {
      append();
      start = end = date;
    }
  }
  append();
  return ranges.join('; ');
}

function summaryField(label: string, value: string): string {
  return `<tr><td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">${escapeHtml(label)}</p>
    <p style="margin:0;font-size:15px;line-height:1.5;color:#0f172a;overflow-wrap:anywhere;font-weight:500;">${escapeHtml(value)}</p>
  </td></tr>`;
}

function notificationLayout(options: {
  title: string; introduction: string; fields: string; extra: string; url: string; button: string;
}): string {
  const url = escapeHtml(options.url);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<title>${escapeHtml(options.title)}</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <tr><td style="padding:28px 32px;background-color:#0f172a;">
          <p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:22px;letter-spacing:-0.5px;">Sha Patisserie</p>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Staff Portal &bull; Admin Notification</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#d97706;text-transform:uppercase;">Action Required</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700;">${escapeHtml(options.title)}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(options.introduction)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;background-color:#f8fafc;overflow:hidden;">
            ${options.fields}
          </table>
          <div style="margin-top:24px;">
            ${options.extra}
          </div>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
                <tr><td align="center" valign="middle" bgcolor="#0f172a" style="padding:12px 20px;border:1px solid #0f172a;border-radius:6px;line-height:20px;mso-line-height-rule:exactly;">
                  <a href="${url}" style="display:block;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;text-align:center;text-decoration:none;">${escapeHtml(options.button)}</a>
                </td></tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">Admin sign-in is required. Please review and approve requests directly in the staff portal rather than replying to this email.</p>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${url}" style="color:#15803d;word-break:break-all;">${url}</a></p>
        </td></tr>
        <tr><td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#64748b;">
          Automated notification from the Sha staff portal. Dates are formatted as dd-mm-yyyy.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Perth date and time as dd-mm-yyyy, hh:mm am/pm */
function perthDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid registration timestamp.');
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date).replace(/\//g, '-');
}

export function notificationConfig() {
  const recipients = [...new Set((process.env.ADMIN_NOTIFY_EMAILS || '').split(',').map((email) => email.trim()).filter(Boolean))];
  if (!recipients.length || recipients.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error('ADMIN_NOTIFY_EMAILS must contain valid comma-separated email addresses.');
  }
  const missing = [
    ...(!process.env.RESEND_API_KEY?.trim() ? ['RESEND_API_KEY'] : []),
    ...(!(process.env.FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim()) ? ['FROM_EMAIL (or EMAIL_FROM)'] : []),
  ];
  if (missing.length) {
    throw new Error(`Admin notification configuration missing or empty: ${missing.join(', ')}. Check the environment variables attached to this deployment.`);
  }
  const configuredUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) throw new Error('APP_URL (or NEXT_PUBLIC_APP_URL) must be configured for notification links. Set APP_URL in this deployment environment and redeploy.');
  const origin = new URL(configuredUrl);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password ||
      (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:')) {
    throw new Error('APP_URL (or NEXT_PUBLIC_APP_URL) must be a valid app URL (HTTPS in production).');
  }
  return { recipients, origin: origin.origin };
}

export async function notifyPendingRegistration(
  notification: PendingRegistrationNotification,
): Promise<{ sent: boolean }> {
  try {
    const { recipients, origin } = notificationConfig();
    const url = new URL('/admin/users', origin);
    const html = notificationLayout({
      title: 'New pending registration',
      introduction: 'A new staff member has registered and needs admin approval.',
      fields: summaryField('Name', notification.name || 'Staff member') +
        summaryField('Email', notification.email) +
        summaryField('Registered at (Perth time)', perthDateTime(notification.registeredAt)),
      extra: '<p style="margin:0;font-size:14px;line-height:1.6;color:#475569;background-color:#f1f5f9;padding:14px 16px;border-radius:8px;">If email verification is enabled, the staff member must verify their email before approval.</p>',
      url: url.href, button: 'Review pending users',
    });

    const deliveries = await Promise.all(recipients.map((recipient) =>
      sendEmail(
        recipient,
        'New pending registration',
        html
      )
    ));

    const failures = deliveries.filter((delivery) => !delivery.sent);
    if (failures.length) {
      console.error('Pending registration notification delivery failed:', notification.userId, failures.map((delivery) => delivery.reason));
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error('Failed to send pending registration notification:', notification.userId, error);
    return { sent: false };
  }
}


export async function notifyMissedClockIn(
  notification: MissedClockInNotification,
  delivery?: { recipient: string; idempotencyKey: string },
): Promise<{ sent: boolean }> {
  try {
    const { recipients, origin } = notificationConfig();

    const url = new URL('/admin/timesheets', origin);

    const html = notificationLayout({
      title: 'Staff member has not clocked in',
      introduction:
        'A scheduled shift started at least 15 minutes ago and the staff member has not clocked in.',

      fields:
        summaryField(
          'Staff',
          notification.name || 'Staff member'
        ) +
        summaryField(
          'Scheduled shift start',
          perthDateTime(notification.scheduledStart)
        ) +
        summaryField(
          'Minutes late when first detected',
          String(notification.minutesLate)
        ),

      extra:
        '<p style="margin:0;font-size:14px;line-height:1.6;color:#475569;background-color:#fef2f2;padding:14px 16px;border-radius:8px;border:1px solid #fecaca;">Please review the shift and contact the staff member if required.</p>',

      url: url.href,
      button: 'Review timesheets',
    });

    const deliveries = await Promise.all(
      (delivery ? [delivery.recipient] : recipients).map(async (recipient) => {
        const result = await sendEmail(
          recipient,
          'Staff member has not clocked in',
          html,
          delivery ? { idempotencyKey: delivery.idempotencyKey } : undefined,
        );
        if (!result.sent) console.error('Missed clock-in recipient failed:', { userId: notification.userId, recipient, reason: result.reason });
        else console.info('Missed clock-in accepted by Resend:', { userId: notification.userId, recipient, emailId: result.id ?? null });
        return result;
      })
    );

    const failures = deliveries.filter(
      (delivery) => !delivery.sent
    );

    return { sent: failures.length === 0 };
  } catch (error) {
    console.error(
      'Failed to send missed clock-in notification:',
      notification.userId,
      error
    );

    return { sent: false };
  }
}

export async function notifyMissedClockOut(
  notification: MissedClockOutNotification,
  delivery?: { recipient: string; idempotencyKey: string },
): Promise<{ sent: boolean }> {
  try {
    const { recipients, origin } = notificationConfig();
    const url = new URL('/admin/timesheets', origin);
    const html = notificationLayout({
      title: 'Staff member has not clocked out',
      introduction: 'A staff member is still clocked in at least 15 minutes after their scheduled shift end.',
      fields: summaryField('Staff', notification.name || 'Staff member') +
        summaryField('Scheduled shift end', perthDateTime(notification.scheduledEnd)),
      extra: '<p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">Please check whether the staff member is still working or forgot to clock out.</p>',
      url: url.href, button: 'Review timesheets',
    });
    const deliveries = await Promise.all((delivery ? [delivery.recipient] : recipients).map(async (recipient) => {
      const result = await sendEmail(recipient, 'Staff member has not clocked out', html,
        delivery ? { idempotencyKey: delivery.idempotencyKey } : undefined);
      if (!result.sent) console.error('Missed clock-out recipient failed:', { userId: notification.userId, recipient, reason: result.reason });
      else console.info('Missed clock-out accepted by Resend:', { userId: notification.userId, recipient, emailId: result.id ?? null });
      return result;
    }));
    return { sent: deliveries.every((result) => result.sent) };
  } catch (error) {
    console.error('Failed to send missed clock-out notification:', notification.userId, error);
    return { sent: false };
  }
}

export async function notifyLeaveReview(notification: LeaveNotification): Promise<{ sent: boolean }> {
  try {
    const { recipients, origin } = notificationConfig();
    const url = new URL('/admin/leave', origin);
    console.info('Leave notification dispatch:', {
      requestId: notification.requestId, event: notification.event, recipientCount: recipients.length,
    });
    const title = notification.event === 'cancellation' ? 'Leave cancellation requested'
      : notification.event === 'changed' ? 'Leave change requested' : 'New Leave Request';
    const dates = leaveDateRanges(notification.dates);
    const html = notificationLayout({
      title,
      introduction: notification.event === 'cancellation'
        ? 'A staff member has asked to cancel their approved leave.'
        : notification.event === 'changed'
          ? 'A staff member has proposed a change to their approved leave.'
          : 'A staff member has submitted leave for your review.',
      fields: summaryField('Staff', notification.staffName || 'Staff member') +
        summaryField('Leave type', LEAVE_LABELS[notification.type] || notification.type) +
        summaryField('Leave period', dates) +
        summaryField('Requested days', String(new Set(notification.dates).size)) +
        summaryField('Total leave hours', notification.totalHours),
      extra: (notification.note
        ? `<div style="padding:16px 20px;border-left:4px solid #cbd5e1;background-color:#f8fafc;border-radius:0 8px 8px 0;">
             <p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">Staff Note</p>
             <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;overflow-wrap:anywhere;">${escapeHtml(notification.note).replace(/\r?\n/g, '<br>')}</p>
           </div>` : '') +
        (notification.event !== 'requested'
          ? '<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#b45309;background-color:#fffbeb;padding:12px 16px;border-radius:8px;border:1px solid #fde68a;">The original leave stays approved until a manager reviews this request.</p>' : ''),
      url: url.href, button: 'Review leave request',
    });

    const deliveries = await Promise.all(recipients.map(async (recipient) => {
      const delivery = await sendEmail(
        recipient,
        title,
        html
      );
      if (delivery.sent) {
        console.info('Leave notification accepted by Resend:', {
          requestId: notification.requestId, recipient, emailId: delivery.id ?? null,
        });
      } else {
        console.error('Leave notification recipient failed:', {
          requestId: notification.requestId, recipient, reason: delivery.reason,
        });
      }
      return delivery;
    }));

    const failures = deliveries.filter((delivery) => !delivery.sent);
    if (failures.length) {
      console.error('Leave notification delivery failed:', notification.requestId, failures.map((delivery) => delivery.reason));
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error('Leave notification failed:', notification.requestId, error);
    return { sent: false };
  }
}