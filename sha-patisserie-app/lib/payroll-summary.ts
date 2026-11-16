import { formatLeaveDateRanges } from '@/lib/leave';
import { approvalError, csvCell, employmentLabel, paidHours, paidLeaveType, workedHours, type PayrollRow, type ReviewRow } from '@/lib/timesheets';

export interface PayrollLeave {
  id: string;
  userId: string;
  staffName: string;
  employmentType?: string | null;
  site: string;
  date: string;
  type: string;
  hours: number;
  rate: number | null;
}

export interface PayrollSummaryRow extends Omit<PayrollRow, 'rate' | 'gross'> {
  rate: number | null;
  leaveHours: number;
  combinedHours: number;
  gross: number | null;
  leaveTypes: string[];
  leaveDates: string[];
}

export function combinePayroll(worked: PayrollRow[], leave: PayrollLeave[]): PayrollSummaryRow[] {
  const rows: PayrollSummaryRow[] = worked.map((row) => ({
    ...row, leaveHours: 0, combinedHours: row.totalHours, leaveTypes: [], leaveDates: [],
  }));
  for (const entry of leave) {
    // Unpaid leave is displayed, but must never increase paid hours or gross.
    const paid = entry.type === 'ANNUAL' || entry.type === 'PERSONAL';
    const candidates = rows.filter((row) => row.userId === entry.userId && row.site === entry.site);
    let row = candidates.find((candidate) => candidate.rate === entry.rate);
    if (!row) {
      row = {
        key: JSON.stringify([entry.userId, entry.site, entry.rate]),
        userId: entry.userId, staffName: entry.staffName, employmentType: entry.employmentType,
        site: entry.site, rate: entry.rate, totalHours: 0, leaveHours: 0, combinedHours: 0,
        gross: entry.rate === null ? null : 0, leaveTypes: [], leaveDates: [],
      };
      rows.push(row);
    }
    if (paid) row.leaveHours += entry.hours;
    if (!row.leaveTypes.includes(entry.type)) row.leaveTypes.push(entry.type);
    if (!row.leaveDates.includes(entry.date)) row.leaveDates.push(entry.date);
    row.leaveDates.sort();
    row.combinedHours = row.totalHours + row.leaveHours;
    row.gross = row.rate === null ? null : row.combinedHours * row.rate;
  }
  return rows;
}

export function summarizePayroll(shifts: ReviewRow[], approvedLeave: PayrollLeave[]) {
  const summary = new Map<string, PayrollRow>();
  const leave = [...approvedLeave];
  let excludedCount = 0;
  for (const row of shifts) {
    const rate = row.rateAtApproval;
    if (row.status !== 'APPROVED' || row.sourceChanged || rate == null ||
        approvalError({ ...row, rate }, row.periods)) {
      excludedCount++;
      continue;
    }
    const leaveType = paidLeaveType(row.attendanceStatus);
    if (leaveType) {
      if (!leave.some((entry) => entry.userId === row.userId && entry.date === row.workDate && entry.type === leaveType)) {
        leave.push({
          id: row.sourceKey, userId: row.userId, staffName: row.staffName,
          employmentType: row.employmentType, site: row.site, date: row.workDate, type: leaveType,
          hours: paidHours(row.periods, row.breakMinutes), rate,
        });
      }
      continue;
    }
    const key = JSON.stringify([row.userId, row.site, rate]);
    const payroll = summary.get(key) ?? {
      key, userId: row.userId, staffName: row.staffName, site: row.site,
      employmentType: row.employmentType, rate, totalHours: 0, gross: 0,
    };
    payroll.totalHours += workedHours(row);
    payroll.gross = payroll.totalHours * rate;
    summary.set(key, payroll);
  }
  return {
    rows: combinePayroll(Array.from(summary.values()), leave),
    excludedCount, approvedCount: shifts.length - excludedCount,
  };
}

export const payrollLeaveDates = (dates: string[]) => dates.length ? formatLeaveDateRanges(dates, true) : '';

export const PAYROLL_COLUMNS = [
  'Staff Member', 'Employment Status', 'Site', 'Rate ($/hr)', 'Worked Hours (H)',
  'Leave Hours (H)', 'Total Hours (H)', 'Total Gross ($)', 'Leave Type', 'Leave Date Range',
];

export function payrollCsv(rows: PayrollSummaryRow[]): string {
  return [
    PAYROLL_COLUMNS,
    ...rows.map((row) => [
      row.staffName, employmentLabel(row.employmentType), row.site, row.rate?.toFixed(2) ?? '',
      row.totalHours.toFixed(2), row.leaveHours.toFixed(2), row.combinedHours.toFixed(2),
      row.gross?.toFixed(2) ?? '', row.leaveTypes.join(', '), payrollLeaveDates(row.leaveDates),
    ]),
  ].map((line) => line.map(csvCell).join(',')).join('\r\n');
}
