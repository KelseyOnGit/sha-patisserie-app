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
  return `<tr><td style="padding:12px 16px;border-bottom:1px solid #e7e5e4;">
    <p style="margin:0 0 5px;font-size:12px;font-weight:bold;color:#78716c;">${escapeHtml(label)}</p>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#1c1917;overflow-wrap:anywhere;">${escapeHtml(value)}</p>
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
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:16px;">
        <tr><td style="padding:24px;background-color:#1c1917;border-radius:16px 16px 0 0;">
          <p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:24px;">Sha Patisserie</p>
          <p style="margin:8px 0 0;color:#d6d3d1;font-size:12px;letter-spacing:1px;">STAFF PORTAL &middot; ADMIN NOTIFICATION</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:bold;color:#92400e;">ACTION REQUIRED</p>
          <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;">${escapeHtml(options.title)}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#57534e;">${escapeHtml(options.introduction)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e5e4;border-radius:8px;background-color:#fafaf9;">
            ${options.fields}
          </table>
          ${options.extra}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 16px;">
            <tr><td bgcolor="#166534" style="border-radius:8px;text-align:center;">
              <a href="${url}" style="display:inline-block;padding:15px 24px;border:1px solid #166534;border-radius:8px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;">${escapeHtml(options.button)}</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#78716c;">Admin sign-in is required. Review and approve requests in the staff portal, not by replying to this email.</p>
          <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#78716c;">If the button does not open, use:<br><a href="${url}" style="color:#166534;word-break:break-all;">${url}</a></p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.6;color:#78716c;">
          Automated notification from the Sha staff portal. Dates are shown as dd-mm-yyyy.
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

function notificationConfig() {
  const recipients = [...new Set((process.env.ADMIN_NOTIFY_EMAILS || '').split(',').map((email) => email.trim()).filter(Boolean))];
  if (!recipients.length || recipients.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error('ADMIN_NOTIFY_EMAILS must contain valid comma-separated email addresses.');
  }
  if (!process.env.RESEND_API_KEY?.trim() || !(process.env.FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim())) {
    throw new Error('RESEND_API_KEY and FROM_EMAIL must be configured for admin notifications.');
  }
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) throw new Error('NEXT_PUBLIC_APP_URL must be configured for notification links.');
  const origin = new URL(configuredUrl);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password ||
      (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:')) {
    throw new Error('NEXT_PUBLIC_APP_URL must be a valid app URL (HTTPS in production).');
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
      extra: '<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#57534e;">If email verification is enabled, the staff member must verify their email before approval.</p>',
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

export async function notifyLeaveReview(notification: LeaveNotification): Promise<{ sent: boolean }> {
  try {
    const { recipients, origin } = notificationConfig();
    const url = new URL('/admin/leave', origin);
    const title = notification.event === 'cancellation' ? 'Leave cancellation requested'
      : notification.event === 'changed' ? 'Leave change requested' : 'New leave request';
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
        ? `<div style="margin-top:20px;padding:16px;border-left:3px solid #a8a29e;background-color:#fafaf9;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#78716c;">STAFF NOTE</p>
            <p style="margin:0;font-size:15px;line-height:1.6;overflow-wrap:anywhere;">${escapeHtml(notification.note).replace(/\r?\n/g, '<br>')}</p>
          </div>` : '') +
        (notification.event !== 'requested'
          ? '<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#92400e;">The original leave stays approved until a manager reviews this request.</p>' : ''),
      url: url.href, button: 'Review leave request',
    });

    const deliveries = await Promise.all(recipients.map((recipient) =>
      sendEmail(
        recipient,
        `${title} - ${notification.staffName || 'Staff member'}`,
        html
      )
    ));

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