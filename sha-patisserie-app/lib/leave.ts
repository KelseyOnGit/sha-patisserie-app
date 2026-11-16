import { formatDMY } from '@/lib/date-format';

export const ANNUAL_NOTICE_DAYS = 7;

export function isEffectiveLeave(status: string): boolean {
  return status === 'APPROVED' || status === 'CANCEL_REQUESTED';
}

export function leaveDate(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose valid leave dates.');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Choose valid leave dates.');
  return date;
}

export function formatLeaveDateRanges(values: string[], alwaysRange = false): string {
  const dates = [...new Set(values)].sort();
  if (!dates.length) throw new Error('Leave notification requires at least one date.');
  dates.forEach(leaveDate);
  const ranges: string[] = [];
  let start = dates[0];
  let end = start;
  const append = () => ranges.push(start === end && !alwaysRange ? formatDMY(start) : `${formatDMY(start)} to ${formatDMY(end)}`);
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

export function leavePeriod(startDate: unknown, endDate: unknown): Date[] {
  const start = leaveDate(startDate);
  const end = leaveDate(endDate);
  const days = (end.getTime() - start.getTime()) / 86400000 + 1;
  if (days < 1 || days > 31) throw new Error('Choose a leave period of 1 to 31 calendar days, with the end on or after the start.');
  return Array.from({ length: days }, (_, index) => new Date(start.getTime() + index * 86400000));
}

/** Today's date in Perth, as a UTC-midnight Date so it compares with leave dates. */
export function perthToday(): Date {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return leaveDate(today);
}

/** Annual leave must start at least ANNUAL_NOTICE_DAYS days from today (Perth time). */
export function annualNoticeError(dates: Date[]): string | null {
  const earliest = Math.min(...dates.map((date) => date.getTime()));
  const minimum = perthToday().getTime() + ANNUAL_NOTICE_DAYS * 86400000;
  return earliest < minimum ? `Annual leave needs at least ${ANNUAL_NOTICE_DAYS} days of notice.` : null;
}

export const LEAVE_LABELS: Record<string, string> = { ANNUAL: 'Annual leave', PERSONAL: 'Personal leave', UNPAID: 'Unpaid leave' };
export const LEAVE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  OTHERS: 'Not approved / Cancelled / Cancellation requested',
};