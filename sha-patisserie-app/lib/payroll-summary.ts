import { formatDMY } from '@/lib/date-format';
import { csvCell, employmentLabel, type PayrollRow } from '@/lib/timesheets';

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

export const PAYROLL_COLUMNS = [
  'Staff Member', 'Employment Status', 'Site', 'Rate ($/hr)', 'Worked Hours',
  'Leave Hours', 'Total', 'Total Gross ($)', 'Leave Type', 'Leave Date',
];

export function payrollCsv(rows: PayrollSummaryRow[]): string {
  return [
    PAYROLL_COLUMNS,
    ...rows.map((row) => [
      row.staffName, employmentLabel(row.employmentType), row.site, row.rate?.toFixed(2) ?? '',
      row.totalHours.toFixed(2), row.leaveHours.toFixed(2), row.combinedHours.toFixed(2),
      row.gross?.toFixed(2) ?? '', row.leaveTypes.join(', '), row.leaveDates.map(formatDMY).join(', '),
    ]),
  ].map((line) => line.map(csvCell).join(',')).join('\r\n');
}
