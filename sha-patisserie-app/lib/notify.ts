const PERTH = 'Australia/Perth';

type RosterShift = { startTime: Date; endTime: Date };

function perthParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: PERTH,
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    weekday: get('weekday'),
    day: get('day'),
    month: get('month'),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

function formatClock(date: Date) {
  const { hour, minute } = perthParts(date);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0
    ? `${displayHour}${suffix}`
    : `${displayHour}:${String(minute).padStart(2, '0')}${suffix}`;
}

export function buildRosterMessage(name: string | null, shifts: RosterShift[]) {
  const firstName = name?.trim().split(/\s+/)[0] || 'there';
  const lines = [...shifts]
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .map((shift) => {
      const { weekday, day, month } = perthParts(shift.startTime);
      return `${weekday} ${day}/${month} ${formatClock(shift.startTime)} - ${formatClock(shift.endTime)}`;
    });

  return [
    `Hi ${firstName},`,
    '',
    'Your roster for this week is',
    ...lines,
    '',
    'Any issues, please contact your Manager',
  ].join('\n');
}

export type SendResult = { sent: boolean; reason?: string };

export async function sendEmail(to: string, subject: string, text: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return { sent: false, reason: 'Email is not configured (RESEND_API_KEY / EMAIL_FROM).' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!response.ok) return { sent: false, reason: `Email provider returned ${response.status}.` };
    return { sent: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { sent: false, reason: 'Could not reach the email provider.' };
  }
}
