// Shared, database-free rules keep the editor, API and payroll calculations in
// agreement. ISO timestamps retain seconds; no hidden quarter-hour rounding.
export interface PayablePeriod {
  start: string;
  end: string;
}

export interface AttendanceRecord {
  id: string;
  clockIn: string;
  clockOut: string | null;
}

export interface ReviewRow {
  sourceKey: string;
  userId: string;
  staffName: string;
  employmentType?: string | null;
  attendanceStatus?: string;
  site: string;
  workDate: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  actual: AttendanceRecord[];
  actualBreakMinutes: number | null;
  scheduledBreakMinutes: number;
  periods: PayablePeriod[];
  breakMinutes: number;
  reason: string;
  status: 'PENDING' | 'APPROVED';
  needsAttention: boolean;
  exceptions: string[];
  inProgress: boolean;
  ambiguous: boolean;
  approvalBlockedReason: string | null;
  sourceChanged: boolean;
  snapshot: string;
  version: number;
  rate: number | null;
  approvedAt: string | null;
  approvedBy: string | null;
  history: {
    action: string;
    actor: string;
    at: string;
    values: unknown;
  }[];
}

export interface PayrollRow {
  key: string;
  userId: string;
  staffName: string;
  employmentType?: string | null;
  site: string;
  rate: number;
  totalHours: number;
  gross: number;
}

export const ATTENDANCE_OPTIONS = [
  ['UNCLASSIFIED', 'Not classified'],
  ['WORKED', 'Worked'],
  ['LATE_CLOCK_IN', 'Late clock-in'],
  ['NO_SHOW', 'No show'],
  ['PERSONAL_LEAVE', 'Personal leave'],
  ['ANNUAL_LEAVE', 'Annual leave'],
  ['UNPAID_LEAVE', 'Unpaid leave'],
] as const;

export function employmentLabel(value: string | null | undefined) {
  return value === 'PART_TIME' ? 'Part Time' : value === 'FULL_TIME' ? 'Full Time' : value === 'CASUAL' ? 'Casual' : 'Not set';
}

export function perthDate(value: Date | string): string {
  // Perth has a fixed UTC+08 offset and does not observe daylight saving.
  return new Date(new Date(value).getTime() + 8 * 3600000).toISOString().slice(0, 10);
}

export function currentWeek(): string {
  const day = new Date(`${perthDate(new Date())}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}

export function weekBounds(value: string) {
  const start = new Date(`${value}T00:00:00+08:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(start.getTime()) || perthDate(start) !== value ||
      new Date(`${value}T00:00:00Z`).getUTCDay() !== 1) {
    throw new Error('Choose a valid Monday for the start of the week.');
  }
  return { start, end: new Date(start.getTime() + 7 * 86400000) };
}

export function localInput(value: string): string {
  return new Date(new Date(value).getTime() + 8 * 3600000).toISOString().slice(0, 19);
}

export function inputTimestamp(value: string): string {
  // Do not use the browser's timezone to interpret datetime-local fields.
  const date = new Date(`${value}+08:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
}

export function timeInput(value: string): string {
  return value ? localInput(value).slice(11, 16) : '';
}

export function editPeriodTime(
  period: PayablePeriod, field: keyof PayablePeriod, value: string, workDate: string,
): PayablePeriod {
  if (!value) return { ...period, [field]: '' };
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error('Enter a valid hour and minute.');
  }
  // Keep the original Perth day behind the time-only editor. Only edited values
  // lose seconds; opening or saving an untouched clock record never rounds it.
  const date = period[field] ? perthDate(period[field]) :
    period.start ? perthDate(period.start) : workDate;
  const updated = { ...period, [field]: inputTimestamp(`${date}T${value}:00`) };
  if (updated.start && updated.end) {
    const startDay = perthDate(updated.start);
    const endTime = timeInput(updated.end);
    const nextDay = endTime < timeInput(updated.start) ||
      (endTime === timeInput(updated.start) && perthDate(period.end || updated.end) > startDay);
    const day = new Date(`${startDay}T00:00:00Z`);
    if (nextDay) day.setUTCDate(day.getUTCDate() + 1);
    // Preserve the unedited end's seconds and milliseconds, even on rollover.
    const previousDay = new Date(`${perthDate(updated.end)}T00:00:00Z`);
    updated.end = new Date(new Date(updated.end).getTime() + day.getTime() - previousDay.getTime()).toISOString();
  }
  return updated;
}

export function readPeriods(value: unknown): PayablePeriod[] {
  if (!Array.isArray(value)) throw new Error('Payable periods must be a list.');
  return value.map((period: unknown) => {
    if (!period || typeof period !== 'object' ||
        !('start' in period) || !('end' in period) ||
        typeof period.start !== 'string' || typeof period.end !== 'string') {
      throw new Error('Every payable period needs a start and end timestamp.');
    }
    return { start: period.start, end: period.end };
  });
}

export function paidHours(periods: PayablePeriod[], breakMinutes: number): number {
  return (periods.reduce((sum, period) =>
    sum + (new Date(period.end).getTime() - new Date(period.start).getTime()) / 60000, 0)
    - breakMinutes) / 60;
}

export function validatePayable(periods: PayablePeriod[], breakMinutes: number, workDate: string) {
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    throw new Error('Break deduction must be a non-negative whole number of minutes.');
  }
  if (periods.length > 20) throw new Error('A timesheet supports at most 20 payable periods.');
  const anchor = new Date(`${workDate}T00:00:00+08:00`).getTime();
  const sorted = periods.map((period) => {
    // Require explicit timezone offsets; reject browser-local or malformed dates.
    if (![period.start, period.end].every((time) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(time))) {
      throw new Error('Payable timestamps must include a timezone.');
    }
    for (const time of [period.start, period.end]) {
      const calendar = new Date(`${time.slice(0, 19)}Z`);
      if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 19) !== time.slice(0, 19)) {
        throw new Error('Payable timestamps must contain a valid calendar date and time.');
      }
    }
    const start = new Date(period.start).getTime();
    const end = new Date(period.end).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new Error('Each payable end must be later than its start.');
    }
    // Full dates support overnight work, while this guard catches accidental
    // month/year edits. A review row cannot span an arbitrary payroll week.
    if (start < anchor - 86400000 || end > anchor + 2 * 86400000) {
      throw new Error('Payable periods must be within one day either side of the work date.');
    }
    return { start, end };
  }).sort((a, b) => a.start - b.start);
  if (sorted.some((period, index) => index > 0 && period.start < sorted[index - 1].end)) {
    throw new Error('Payable periods cannot overlap.');
  }
  if (paidHours(periods, breakMinutes) < 0) {
    throw new Error('Break deduction cannot exceed the payable duration.');
  }
}

export function actualPeriods(actual: AttendanceRecord[]): PayablePeriod[] {
  return actual.filter((log) => log.clockOut !== null)
    .map((log) => ({ start: log.clockIn, end: log.clockOut! }));
}

export function recordedBreakMinutes(start: Date | null, end: Date | null): number | null {
  if (!start || !end) return null;
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutes < 0) throw new Error('Recorded break end is earlier than its start.');
  return minutes;
}

export function samePeriods(a: PayablePeriod[], b: PayablePeriod[]): boolean {
  const normalize = (periods: PayablePeriod[]) => periods.map((period) => ({
    start: new Date(period.start).toISOString(),
    end: new Date(period.end).toISOString(),
  })).sort((x, y) => x.start.localeCompare(y.start));
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

export function requiresReason(row: ReviewRow, periods: PayablePeriod[], breakMinutes: number): boolean {
  return !row.scheduledStart || row.actual.length === 0 || row.sourceChanged ||
    row.ambiguous || row.inProgress ||
    !samePeriods(periods, actualPeriods(row.actual)) ||
    (row.actualBreakMinutes === null ? breakMinutes > 0 : breakMinutes !== row.actualBreakMinutes);
}

export function isLiveAttendance(
  row: Pick<ReviewRow, 'inProgress' | 'workDate'>,
  today = perthDate(new Date()),
): boolean {
  return row.inProgress && row.workDate >= today;
}

export function approvalError(row: ReviewRow, periods: PayablePeriod[]): string | null {
  if (row.approvalBlockedReason) return row.approvalBlockedReason;

  // Only block "in progress" for today or future rows. For past days (e.g. a
  // forgotten clock-out), the manager can override by entering the payable
  // times or adjustment hours, with a reason.
  if (isLiveAttendance(row)) {
    return 'Attendance or a break is still in progress. Finish it before approval.';
  }

  // Roster overlap no longer blocks approval. requiresReason() now asks for a
  // note instead, so the override is recorded.

  if (row.scheduledEnd && new Date(row.scheduledEnd).getTime() > Date.now() && row.actual.length === 0) {
    return 'An unworked future shift cannot be approved.';
  }
  if (periods.some((period) => new Date(period.end).getTime() > Date.now())) {
    return 'Future payable hours cannot be approved.';
  }
  if (row.rate === null || !Number.isFinite(row.rate) || row.rate < 0) {
    return 'Set a valid hourly rate in the staff profile before approving.';
  }
  return null;
}

export function csvCell(value: string | number): string {
  const text = String(value);
  // Staff-controlled text must not become a spreadsheet formula on export.
  return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`;
}
