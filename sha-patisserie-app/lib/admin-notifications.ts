import { sendEmail } from '@/lib/notify';
import { formatDMY } from '@/lib/date-format';
import { LEAVE_LABELS } from '@/lib/leave';

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
    const html = `<div style="font-family: sans-serif; color: #1c1917;">
      <h2>New pending registration</h2>
      <p><strong>Name:</strong> ${escapeHtml(notification.name || 'N/A')}</p>
      <p><strong>Email:</strong> ${escapeHtml(notification.email)}</p>
      <p><strong>Registered at:</strong> ${escapeHtml(perthDateTime(notification.registeredAt))}</p>
      <p>This account requires admin approval. If email verification is enabled, the staff member must verify their email before approval.</p>
      <p><a href="${escapeHtml(url.href)}">Review pending registrations</a> (admin sign-in required)</p>
    </div>`;

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
    const dates = [...notification.dates].sort();
    const html = `<div style="font-family: sans-serif; color: #1c1917;">
      <h2>${title}</h2>
      <p><strong>Staff:</strong> ${escapeHtml(notification.staffName || 'Staff member')}</p>
      <p><strong>Type:</strong> ${escapeHtml(LEAVE_LABELS[notification.type] || notification.type)}</p>
      <p><strong>Requested dates:</strong> ${dates.map((date) => formatDMY(date)).join(', ')}</p>
      <p><strong>Total hours:</strong> ${escapeHtml(notification.totalHours)}</p>
      ${notification.note ? `<p><strong>Staff note:</strong> ${escapeHtml(notification.note).replace(/\r?\n/g, '<br>')}</p>` : ''}
      ${notification.event !== 'requested' ? '<p>The original leave stays approved until a manager reviews this request.</p>' : ''}
      <p><a href="${escapeHtml(url.href)}">Review leave requests</a> (admin sign-in required)</p>
    </div>`;

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