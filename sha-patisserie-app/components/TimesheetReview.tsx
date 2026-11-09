'use client';

import { formatDMY } from '@/lib/date-format';
import { PAYROLL_COLUMNS, payrollCsv, type PayrollSummaryRow } from '@/lib/payroll-summary';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PayrollBreakStatus from '@/components/PayrollBreakStatus';
import AddWorkedShiftDialog from '@/components/AddWorkedShiftDialog';
import {
  actualPeriods, adjustedPayable, approvalError, currentWeek, editPeriodTime, perthDate, timeInput,
  isLiveAttendance, paidHours, paidLeaveType, workedHours, samePeriods, validatePayable,
  type PayablePeriod, type ReviewRow,
  ATTENDANCE_OPTIONS, employmentLabel,
} from '@/lib/timesheets';

interface Report {
  leaveRows?: { id: string; userId: string; staffName: string; employmentType: string | null; site: string; date: string; type: string; hours: number }[];
  shifts: ReviewRow[];
  rows: PayrollSummaryRow[];
  excludedCount: number;
  approvedCount: number;
  venues?: string[];
  inactiveUserIds?: string[];
}

interface WeekDay {
  dateStr: string;
  dayLetter: string;
  dayShort: string;
  displayDate: string;
}

const timeFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth', hour: '2-digit', minute: '2-digit',
});
const shortTimeFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth', hour: '2-digit', minute: '2-digit', hour12: false,
});
const dayFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth', month: 'short', day: 'numeric',
});
const time = (value: string) => timeFormatter.format(new Date(value));

const timeShort = (value: string) => {
  const d = new Date(value);
  const parts = shortTimeFormatter.format(d).split(':');
  return `${parts[0]}.${parts[1]}`;
};

const dayHint = (value: string, workDate: string) =>
  value && perthDate(value) !== workDate ? (perthDate(value) > workDate ? ' (+1 day)' : ' (previous day)') : '';

const status = (row: ReviewRow) => row.sourceChanged ? 'Needs attention' :
  row.status === 'APPROVED' ? 'Approved' : row.needsAttention ? 'Needs attention' : 'Pending review';

function getWeekDays(weekStartStr: string): WeekDay[] {
  const days: WeekDay[] = [];
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const shorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  try {
    const mondayDate = new Date(`${weekStartStr}T00:00:00Z`);
    for (let i = 0; i < 7; i++) {
      const cur = new Date(mondayDate.getTime() + i * 86400000);
      const dateStr = cur.toISOString().slice(0, 10);
      const displayDate = dayFormatter.format(new Date(`${dateStr}T12:00:00+08:00`));

      days.push({
        dateStr,
        dayLetter: letters[i],
        dayShort: shorts[i],
        displayDate,
      });
    }
  } catch {
    // Fallback if invalid
  }
  return days;
}

const inputClass = 'min-w-0 max-w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base sm:text-sm disabled:bg-stone-100';
const buttonClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50';
const InactiveBadge = () => (
    <span className="ml-2 inline-block rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Inactive</span>
  );
export default function TimesheetReview({ userId }: { userId: string }) {
  const [tab, setTab] = useState<'confirm' | 'payroll'>('confirm');
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [venue, setVenue] = useState('');
  const [staff, setStaff] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [savingBatch, setSavingBatch] = useState(false);
  const [reviewReasons, setReviewReasons] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
   const [addOpen, setAddOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<{ userId: string; date: string; venue: 'SHA' | 'ZB' } | null>(null);
   const [prefill, setPrefill] = useState<{ sourceKey: string; periods: PayablePeriod[]; breakMinutes: number; reason: string } | null>(null);


  const reportQuery = useQuery<Report>({
    queryKey: ['timesheet-report', userId, weekStart],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/admin/reports?weekStart=${encodeURIComponent(weekStart)}`, {
        signal, cache: 'no-store',
      });
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`Reports request failed (${res.status}). Please sign in again.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load reports.');
      if (!Array.isArray(data.shifts) || !Array.isArray(data.rows)) throw new Error('Invalid reports response.');
      return data;
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: weekStart === currentWeek() && !savingBatch && !selected ? 15_000 : false,
    refetchIntervalInBackground: false,
    retry: false,
  });
  const report = reportQuery.data;
  const inactiveIds = new Set(report?.inactiveUserIds ?? []);
  const loading = reportQuery.isPending;
  const syncing = reportQuery.isFetching;
  const writesBlocked = savingBatch || syncing || Boolean(reportQuery.error);

  const refreshReport = async () => {
    const result = await reportQuery.refetch();
    return !result.error;
  };
  const clearDrafts = (keys: string[]) => {
    setAdjustments((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !keys.includes(key))));
    setReviewReasons((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !keys.includes(key))));
  };
     const handleWorkedShiftCreated = async (created: { sourceKey: string; start: string; end: string; breakMinutes: number; reason: string }) => {
     setAddOpen(false);
     setError('');
     const result = await reportQuery.refetch();
     const row = result.data?.shifts.find((item) => item.sourceKey === created.sourceKey);
     if (!row) {
       setMessage('Shift added. Find it in the table and open Details to enter the hours.');
       return;
     }
     setPrefill({ sourceKey: row.sourceKey, periods: [{ start: created.start, end: created.end }], breakMinutes: created.breakMinutes, reason: created.reason });
     setSelected(row);
   };
  const handleAdminClockOut = async (row: ReviewRow) => {
    const openLog = row.actual.find((log) => log.clockOut === null);
    if (!openLog) return;
    const suggested = row.scheduledEnd && new Date(row.scheduledEnd).getTime() < Date.now()
      ? timeShort(row.scheduledEnd).replace('.', ':') : '';
    const input = window.prompt(`Clock out ${row.staffName} at what time? (24h HH:MM)`, suggested);
    if (!input) return;
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(input.trim());
    if (!match) { setError('Enter the time as HH:MM, e.g. 14:30.'); return; }
    let out = new Date(`${row.workDate}T${match[1].padStart(2, '0')}:${match[2]}:00+08:00`);
    if (out <= new Date(openLog.clockIn)) out = new Date(out.getTime() + 86400000);
    setError(''); setSavingBatch(true);
    try {
      const response = await fetch('/api/admin/reports/clock-out', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: row.userId, timeLogId: openLog.id, clockOut: out.toISOString() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to clock out.');
      await refreshReport();
      setMessage(`${row.staffName} clocked out.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clock out.');
    } finally { setSavingBatch(false); }
  };
  const shifts = report?.shifts ?? [];
  const weekDays = getWeekDays(weekStart);

  const filtered = shifts.filter((row) => (!venue || row.site === venue) &&
    (!staff || row.userId === staff) && (!statusFilter || status(row) === statusFilter));
  const rowsByUser = new Map<string, ReviewRow[]>();
  const rowsByUserDay = new Map<string, Map<string, ReviewRow[]>>();
  for (const row of filtered) {
    const userRows = rowsByUser.get(row.userId) ?? [];
    userRows.push(row);
    rowsByUser.set(row.userId, userRows);
    const days = rowsByUserDay.get(row.userId) ?? new Map<string, ReviewRow[]>();
    const dayRows = days.get(row.workDate) ?? [];
    dayRows.push(row);
    days.set(row.workDate, dayRows);
    rowsByUserDay.set(row.userId, days);
  }
  const payroll = (report?.rows ?? []).filter((row) =>
    (!venue || row.site === venue) && (!staff || row.userId === staff));
  const leave = [
    ...(report?.leaveRows ?? []),
    ...shifts.filter((row) => paidLeaveType(row.attendanceStatus) &&
      !(report?.leaveRows ?? []).some((entry) => entry.userId === row.userId &&
        entry.date === row.workDate && entry.type === paidLeaveType(row.attendanceStatus)))
      .map((row) => ({
        id: row.sourceKey, userId: row.userId, staffName: row.staffName,
        employmentType: row.employmentType ?? null, site: row.site, date: row.workDate,
        type: paidLeaveType(row.attendanceStatus)!, hours: paidHours(row.periods, row.breakMinutes),
      })),
  ].filter((entry) => (!venue || entry.site === venue) && (!staff || entry.userId === staff));
  const sites = Array.from(new Set([
    ...(report?.venues ?? []),
    ...shifts.map((row) => row.site),
    ...(report?.leaveRows ?? []).map((row) => row.site),
  ])).filter(Boolean).sort();
  const people = [...new Map([
    ...shifts.map((row) => [row.userId, row.staffName] as const),
    ...(report?.leaveRows ?? []).map((row) => [row.userId, row.staffName] as const),
  ]).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]));
  const totalHours = payroll.reduce((sum, row) => sum + row.totalHours, 0);
  const totalLeaveHours = payroll.reduce((sum, row) => sum + row.leaveHours, 0);
  const totalPaidHours = payroll.reduce((sum, row) => sum + row.combinedHours, 0);
  const totalGross = payroll.reduce((sum, row) => sum + (row.gross ?? 0), 0);
  const missingPayrollRate = payroll.some((row) => row.rate === null);

  // Group shifts by staff member to produce 1 consolidated row per staff member
  const consolidatedStaffList = (() => {
    const staffMap = new Map<string, {
      userId: string;
      staffName: string;
      employmentType?: string | null;
      site: string;
      rate: number | null;
      shiftMap: Map<string, ReviewRow>;
    }>();

    for (const row of filtered) {
      let existing = staffMap.get(row.userId);
      if (!existing) {
        existing = {
          userId: row.userId,
          staffName: row.staffName,
          employmentType: row.employmentType,
          site: row.site,
          rate: row.rate,
          shiftMap: new Map(),
        };
        staffMap.set(row.userId, existing);
      }
      existing.shiftMap.set(row.workDate, row);
    }

    return Array.from(staffMap.values()).sort((a, b) => a.staffName.localeCompare(b.staffName));
  })();

  const handleAdjustmentChange = (sourceKey: string, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [sourceKey]: value,
    }));
  };

  const saveAttendance = async (row: ReviewRow, attendanceStatus: string) => {
    setError(''); setSavingBatch(true);
    try {
      const response = await fetch('/api/admin/reports/timesheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceKey: row.sourceKey, weekStart, version: row.version, snapshot: row.snapshot,
          action: 'SAVE', periods: row.periods, breakMinutes: row.breakMinutes,
          reason: row.reason || `Attendance classified as ${attendanceStatus.replaceAll('_', ' ').toLowerCase()}`,
          attendanceStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save attendance classification.');
      setMessage('Attendance classification saved. Leave approval is managed in Leave Requests.');
      await refreshReport();
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to classify attendance.'); }
    finally { setSavingBatch(false); }
  };

  // Bulk Save and Approve for a specific staff member or all staff
  const handleSaveAndApprove = async (targetUserId?: string) => {
    setError('');
    setMessage('');
    setSavingBatch(true);

    try {
      const targetRows = filtered.filter((row) => {
        if (targetUserId && row.userId !== targetUserId) return false;
        if (isLiveAttendance(row)) return false;
        return true;
      });

      if (!targetRows.length) {
        throw new Error('No completed timesheets to approve.');
      }
 
      const batchItems = targetRows.map((row) => {
        const reviewReason = (reviewReasons[row.sourceKey] ?? row.reason).trim();
        const adjustedVal = adjustments[row.sourceKey] !== undefined
          ? adjustments[row.sourceKey]
          : paidHours(row.periods, row.breakMinutes);

        const { periods, breakMinutes } = adjustedPayable(row, adjustments[row.sourceKey]);
        try {
          const unchangedApproval = row.status === 'APPROVED' && !row.sourceChanged &&
            samePeriods(periods, row.periods) && breakMinutes === row.breakMinutes;
          if (!unchangedApproval) {
            validatePayable(periods, breakMinutes, row.workDate);
            const invalid = approvalError(row, periods);
            if (invalid) throw new Error(invalid);
          }
        } catch (error) {
          throw new Error(`${row.staffName} (${row.workDate}): ${error instanceof Error ? error.message : 'Invalid payable values.'}`);
        }

        const isAdjusted = adjustedVal !== paidHours(row.periods, row.breakMinutes);
        const reason = reviewReason || (isAdjusted
          ? `Adjusted to ${adjustedVal.toFixed(2)}h in weekly consolidation`
          : 'Weekly timesheet approved');

        return {
          sourceKey: row.sourceKey,
          weekStart,
          version: row.version,
          snapshot: row.snapshot,
          action: 'APPROVE' as const,
          breakMinutes,
          periods,
          reason,
        };
      });

      const res = await fetch('/api/admin/reports/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: batchItems }),
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`Timesheet save returned an unexpected response (${res.status}). Refresh and check approval status before retrying.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve timesheets.');

      setMessage(data.message || 'Timesheets successfully approved and saved!');
      if (await refreshReport()) clearDrafts(batchItems.map((item) => item.sourceKey));
    } catch (err) {
      console.error('Batch approval failed:', err);
      setError(err instanceof Error ? err.message : 'Error approving timesheets.');
    } finally {
      setSavingBatch(false);
    }
  };

  const download = () => {
    const lines = payrollCsv(payroll);
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved-payroll-${weekStart}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-stone-900 pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin reports</p>
          <h1 className="mt-1 text-3xl font-serif">Worked hours &amp; payroll</h1>
          <p className="mt-1 text-sm text-stone-600">
            Review and adjust actual worked hours. Consolidated weekly Monday to Sunday view.
          </p>
        </div>

        {tab === 'confirm' && (
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setAddTarget(null); setAddOpen(true); }}
              disabled={writesBlocked || loading}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50 transition-all"
            >
              Add worked shift
            </button>
            {consolidatedStaffList.length > 0 && (
              <button
                onClick={() => handleSaveAndApprove()}
                disabled={writesBlocked || loading}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {savingBatch ? 'Processing...' : 'Save and Approved All'}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Report sections">
        <button
          role="tab"
          aria-selected={tab === 'confirm'}
          onClick={() => setTab('confirm')}
          className={`${buttonClass} ${tab === 'confirm' ? 'bg-stone-900 text-white' : 'bg-white'}`}
        >
          Confirm Worked Hours
        </button>
        <button
          role="tab"
          aria-selected={tab === 'payroll'}
          onClick={() => setTab('payroll')}
          className={`${buttonClass} ${tab === 'payroll' ? 'bg-stone-900 text-white' : 'bg-white'}`}
        >
          Payroll Summary
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-responsive-form flex min-w-0 flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:p-4">
        <label className="grid w-44 min-w-0 max-w-full gap-1 text-sm font-medium">
          Week starting Monday
          <input
            type="date"
            disabled={savingBatch}
            value={weekStart}
            onChange={(e) => {
              setWeekStart(e.target.value);
              setAdjustments({});
              setReviewReasons({});
              setSelected(null);
              setError('');
              setMessage('');
              setVenue('');
              setStaff('');
            }}
            className={`${inputClass} w-full min-h-11`}
          />
        </label>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="payroll-filters"
          onClick={() => setFiltersOpen((open) => !open)}
          className={`${buttonClass} min-h-11 xl:hidden`}
        >
          Filters{(venue || staff || (tab === 'confirm' && statusFilter))
            ? ` (${[venue, staff, tab === 'confirm' ? statusFilter : ''].filter(Boolean).length})` : ''}
        </button>
        <div
          id="payroll-filters"
          className={`${filtersOpen ? 'grid' : 'hidden'} order-last w-full min-w-0 gap-3 border-t border-stone-200 pt-3 sm:grid-cols-3 xl:order-none xl:flex xl:w-auto xl:flex-wrap xl:border-0 xl:pt-0`}
        >
          <label className="grid gap-1 text-sm font-medium">
            Venue
            <select value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass}>
              <option value="">All venues</option>
              {sites.map((site) => (
                <option key={site}>{site}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Staff
            <select value={staff} onChange={(e) => setStaff(e.target.value)} className={inputClass}>
              <option value="">All staff</option>
              {people.map(([id, name]) => (
                <option key={id} value={id}>
                 {name}{inactiveIds.has(id) && <InactiveBadge />}
                </option>
              ))}
            </select>
          </label>
          {tab === 'confirm' && (
            <label className="grid gap-1 text-sm font-medium">
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                <option value="">All statuses</option>
                {['Pending review', 'Needs attention', 'Approved'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <button onClick={() => void refreshReport()} disabled={syncing || savingBatch} className={buttonClass}>
          {syncing ? 'Refreshing...' : 'Refresh'}
        </button>
        {tab === 'payroll' && (
          <button
            onClick={download}
            disabled={writesBlocked || loading || (payroll.length === 0 && !(report?.leaveRows || []).some((row) => (!venue || row.site === venue) && (!staff || row.userId === staff)))}
            className={`${buttonClass} bg-stone-900 text-white`}
          >
            Download approved CSV
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-200">{error}</p>}
      {reportQuery.error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
        Could not refresh reports: {reportQuery.error.message} Displayed figures may be outdated. Refresh before approving or exporting.
      </p>}
      {syncing && report && <p role="status" className="text-sm text-stone-500">Updating report in the background...</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">{message}</p>}

      {/* Metric Cards */}
      {report && (
        <div data-testid="payroll-summary-cards" className="hidden gap-3 md:grid md:grid-cols-3">
          {[
            ['Awaiting approval / pending', shifts.filter((row) => row.status !== 'APPROVED').length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
              <p className="mt-1 text-2xl font-serif text-stone-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Tab Views */}
      {loading ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          Loading staff timesheets...
        </div>
      ) : report && tab === 'confirm' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500 px-1 gap-1">
            <p>
              💡 <strong>Adjustment rules:</strong> If there is a break recorded, standard 0.5 hr deduction applies. Type directly into the yellow box to standardize hours (e.g. 6.45 → 6.5).
            </p>
            <p className="font-mono text-stone-400">Times in Perth AWST (UTC+08)</p>
          </div>

          <p className="text-xs text-stone-500 lg:hidden">Swipe dates sideways. Staff names stay fixed; scroll down for more staff.</p>
          <div role="region" aria-label="Scrollable weekly worked hours" tabIndex={0} className="admin-calendar-scroll overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table role="table" aria-label="Weekly worked hours" className="admin-calendar-table admin-payroll-calendar w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px]">
                  <th className="p-3 font-bold w-[15%]">Staff Member</th>
                  {weekDays.map((d) => (
                    <th key={d.dateStr} className="p-2 text-center border-l border-stone-200/60">
                      <div className="font-extrabold text-sm text-stone-800">{d.dayLetter}</div>
                      <div className="text-[10px] text-stone-500 font-normal">{d.displayDate}</div>
                    </th>
                  ))}
                  <th className="p-3 text-right w-[11%] border-l border-stone-200/60 font-bold">
                    Final Total (Hours)
                  </th>

                </tr>
              </thead>
              <tbody>
                {consolidatedStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-stone-500 text-sm">
                      No actual clock records found for this week.
                    </td>
                  </tr>
                ) : (
                  consolidatedStaffList.map((staffItem) => {
                    // Compute final total of adjusted hours for this staff member
                    const finalStaffTotal = weekDays.reduce((acc, d) => {
                      return acc + (rowsByUserDay.get(staffItem.userId)?.get(d.dateStr) ?? [])
                        .reduce((total, row) => {
                          if (paidLeaveType(row.attendanceStatus)) return total;
                          const val = adjustments[row.sourceKey] !== undefined
                            ? adjustments[row.sourceKey]
                            : paidHours(row.periods, row.breakMinutes);
                          return total + (Number.isFinite(val) ? val : 0);
                        }, 0);
                    }, 0);

                    // Check if all shifts are approved
                    const staffShifts = rowsByUser.get(staffItem.userId) ?? [];
                    const isAllApproved = staffShifts.length > 0 && staffShifts.every((s) => s.status === 'APPROVED');
                    const approvedByName = staffShifts.find((s) => s.approvedBy)?.approvedBy;
                    

                    return (
                      <tr key={staffItem.userId} className="border-b border-stone-200 hover:bg-stone-50/50">
                        {/* Staff Name & Site */}
                        <th scope="row" className="p-3.5 align-top font-normal">
                          <p className="font-bold text-stone-900 text-sm">{staffItem.staffName}{inactiveIds.has(staffItem.userId) && <InactiveBadge />}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-stone-600">{employmentLabel(staffItem.employmentType)}</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">{staffItem.site}</p>
                          {staffItem.rate !== null && (
                            <p className="text-stone-400 text-[10px] mt-0.5">${staffItem.rate.toFixed(2)} / hr</p>
                          )}
                        </th>

                        {/* Monday to Sunday Columns */}
                        {weekDays.map((d) => {
                          const row = staffItem.shiftMap.get(d.dateStr);

                          if (!row) {
                            return (
                              <td
                                key={d.dateStr}
                                className="admin-empty-day p-3 text-center align-middle border-l border-stone-200/60 bg-stone-50/30 text-stone-300 select-none"
                              >
                                {d.dateStr <= perthDate(new Date()) ? (
                                  <button type="button" disabled={writesBlocked}
                                    onClick={() => { setAddTarget({ userId: staffItem.userId, date: d.dateStr, venue: staffItem.site === 'Zushi Bento' ? 'ZB' : 'SHA' }); setAddOpen(true); }}
                                    aria-label={`Add worked shift for ${staffItem.staffName} on ${formatDMY(d.dateStr)}`}
                                    title="Add a worked shift"
                                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-stone-300 text-lg font-bold leading-none text-stone-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40">+</button>
                                ) : '—'}
                              </td>
                            );
                          }

                          const firstLog = row.actual[0];
                          const liveAttendance = isLiveAttendance(row);
                          const pastUnfinished = row.inProgress && !liveAttendance;
                          const clockInTime = firstLog ? timeShort(firstLog.clockIn) : '—';
                          const clockOutTime = firstLog?.clockOut ? timeShort(firstLog.clockOut) : null;
                          const rawComputedHours = paidHours(row.periods, row.breakMinutes);
                          const adjVal = adjustments[row.sourceKey] !== undefined
                            ? adjustments[row.sourceKey]
                            : Number(rawComputedHours.toFixed(2));

                          return (
                            <td
                              key={d.dateStr}
                              data-label={`${d.dayShort} ${d.displayDate}`}
                              className={`p-2.5 align-top border-l border-stone-200/60 ${
                                row.status === 'APPROVED' ? 'bg-emerald-50/20' : 'bg-white'
                              }`}
                            >
                              <div className="space-y-1 text-[11px]">
                                <select
                                  aria-label={`Attendance for ${row.staffName} on ${row.workDate}`}
                                  value={
                                    row.attendanceStatus && row.attendanceStatus !== 'UNCLASSIFIED'
                                      ? row.attendanceStatus
                                      : row.periods.length > 0 || row.actual.length > 0
                                        ? 'WORKED'
                                        : 'UNCLASSIFIED'
                                  }
                                  disabled={writesBlocked || liveAttendance}
                                  onChange={(event) => void saveAttendance(row, event.target.value)}
                                  className="mb-1 w-full rounded border border-stone-300 bg-white p-1 text-[10px] disabled:bg-stone-100"
                                >
                                  {ATTENDANCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">In:</span>
                                  <span className="font-mono text-stone-800">{clockInTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">Out:</span>
                                  {clockOutTime ? (
                                    <span className="font-mono text-stone-800">{clockOutTime}</span>
                                  ) : (
                                    <span className="inline-block px-1 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                      {row.actual.length ? liveAttendance ? 'In progress' : 'Missing clock-out' : 'No clock record'}
                                    </span>
                                  )}
                                </div>
                                {row.inProgress && row.actual.some((log) => log.clockOut === null) && (
                                  <button
                                    type="button"
                                    disabled={writesBlocked}
                                    onClick={() => void handleAdminClockOut(row)}
                                    className="w-full rounded border border-amber-400 bg-amber-50 px-1 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    Clock out
                                  </button>
                                )}
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">Break:</span>
                                  <PayrollBreakStatus row={row} />
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">{paidLeaveType(row.attendanceStatus) ? 'Leave hours:' : 'Total:'}</span>
                                  <span className="font-semibold text-stone-900">
                                    {liveAttendance ? 'In prog.' : `${rawComputedHours.toFixed(2)}h`}
                                  </span>
                                </div>

                                {/* Yellow Adjustment Total Hour Input */}
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-stone-600">Adjusted hours:</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="24"
                                    aria-label={`Adjusted hours for ${row.staffName} on ${row.workDate}`}
                                    disabled={liveAttendance || writesBlocked}
                                    value={Number.isFinite(adjVal) ? adjVal : ''}
                                    onChange={(e) =>
                                      handleAdjustmentChange(row.sourceKey, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 rounded border border-amber-400 bg-[#fef08a] px-1.5 py-0.5 text-center font-bold text-stone-900 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                                  />
                                </div>
                                {pastUnfinished && row.status !== 'APPROVED' && <label className="grid gap-1 pt-1">
                                  Explanation (optional)
                                  <textarea maxLength={2000} disabled={writesBlocked}
                                    value={reviewReasons[row.sourceKey] ?? row.reason}
                                    onChange={(event) => setReviewReasons((current) => ({
                                      ...current, [row.sourceKey]: event.target.value,
                                    }))}
                                    placeholder="Explain verified hours and the missing clock-out or unfinished break."
                                    className="w-full rounded border border-stone-300 bg-white p-1 text-[10px]" />
                                </label>}

                                <div className="text-right pt-0.5">
                                  <button
                                    onClick={() => setSelected(row)}
                                    disabled={writesBlocked}
                                    className="text-sm xl:text-[10px] text-stone-500 hover:text-stone-700 underline"
                                  >
                                    Details
                                  </button>
                                </div>
                                
                              </div>
                            </td>
                          );
                        })}

                        {/* Final Weekly Total */}
                        <td data-label="Final total (hours)" className="p-3 text-right align-middle border-l border-stone-200/60">
                          <p className="text-base font-extrabold text-stone-900 font-mono">
                            {finalStaffTotal.toFixed(2)}
                          </p>
                          <p className="text-[10px] font-semibold uppercase text-stone-500">hrs</p>
                          <p className="text-[10px] text-stone-500">Worked hours</p>
                          {['ANNUAL', 'PERSONAL'].map((type) => {
                            const hours = leave.filter((entry) => entry.userId === staffItem.userId && entry.type === type)
                              .reduce((sum, entry) => sum + entry.hours, 0);
                            return hours > 0 ? <p key={type} className="mt-1 text-[10px] text-emerald-800">
                              {type === 'ANNUAL' ? 'Annual leave' : 'Other paid leave'}: {hours.toFixed(2)} h
                            </p> : null;
                          })}
                          {staffShifts.some((row) => workedHours(row) > 0 && (report?.leaveRows ?? [])
                            .some((entry) => entry.userId === row.userId && entry.date === row.workDate)) && (
                            <p role="status" className="mt-1 text-[10px] text-amber-800">Worked hours overlap approved leave. Review the day&apos;s attendance classification.</p>
                          )}
                          {isAllApproved && (
                            <span className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              ✓ Approved{approvedByName ? ` by ${approvedByName}` : ''}
                            </span>
                          )}
                        </td>


                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : report && (
        <div className="space-y-3">

          <p className="text-xs text-stone-500 lg:hidden">Swipe to see payroll columns. Staff names stay fixed.</p>
          <div role="region" aria-label="Scrollable approved payroll summary" tabIndex={0} className="admin-calendar-scroll overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table role="table" aria-label="Approved payroll summary" className="admin-calendar-table admin-payroll-summary w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-bold uppercase text-stone-500">
                <tr>
                  {PAYROLL_COLUMNS.map((label) => (
                    <th key={label} className="p-4">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!payroll.length ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-stone-500">
                      No approved payable hours for this selection.
                    </td>
                  </tr>
                ) : (
                  payroll.map((row) => (
                    <tr key={row.key} className="border-t border-stone-100">
                      <td data-label="Staff Member" className="p-4 font-semibold">{row.staffName}{inactiveIds.has(row.userId) && <InactiveBadge />}</td>
                      <td data-label="Employment Status" className="p-4 text-stone-600">{employmentLabel(row.employmentType)}</td>
                      <td data-label="Venue" className="p-4 text-stone-600">{row.site}</td>
                      <td data-label="Rate ($/hr)" className="p-4 font-mono">{row.rate === null ? 'Rate not set' : `$${row.rate.toFixed(2)}`}</td>
                      <td data-label="Worked hours" className="p-4 font-mono font-bold">{row.totalHours.toFixed(2)} h</td>
                      <td data-label="Leave hours" className="p-4 font-mono font-bold">{row.leaveHours.toFixed(2)} h</td>
                      <td data-label="Total" className="p-4 font-mono font-bold">{row.combinedHours.toFixed(2)} h</td>
                      <td data-label="Total Gross ($)" className="p-4 font-mono font-bold text-emerald-800">{row.gross === null ? 'Rate not set' : `$${row.gross.toFixed(2)}`}</td>
                      <td data-label="Leave Type" className="p-4 text-xs">{row.leaveTypes.join(', ') || '—'}</td>
                      <td data-label="Leave Date" className="p-4 text-xs">{row.leaveDates.map(formatDMY).join(', ') || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t bg-stone-50 font-semibold">
                <tr>
                  <td colSpan={4} className="p-4">Total</td>
                  <td data-label="Total worked hours" className="p-4 font-mono font-extrabold">{totalHours.toFixed(2)} h</td>
                  <td data-label="Total leave hours" className="p-4 font-mono font-extrabold">{totalLeaveHours.toFixed(2)} h</td>
                  <td data-label="Total paid hours" className="p-4 font-mono font-extrabold">{totalPaidHours.toFixed(2)} h</td>
                  <td data-label="Total gross" className="p-4 font-mono font-extrabold text-emerald-900">${totalGross.toFixed(2)}{missingPayrollRate ? ' (incomplete)' : ''}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          {missingPayrollRate && <p role="alert" className="text-sm text-amber-800">Some leave has no pay rate. Set the staff profile rate before using this payroll total; those gross amounts are blank in the CSV.</p>}
        </div>
      )}
   {addOpen && (
     <AddWorkedShiftDialog
       weekDays={weekDays.map((day) => day.dateStr)}
       today={perthDate(new Date())}
       defaultVenue={addTarget?.venue ?? (venue === 'Zushi Bento' ? 'ZB' : 'SHA')}
       initialUserId={addTarget?.userId}
       initialDate={addTarget?.date}
       onClose={() => setAddOpen(false)}
       onCreated={handleWorkedShiftCreated}
     />
   )}
   {selected && <ReviewEditor key={`${selected.sourceKey}:${selected.version}`} row={selected} weekStart={weekStart} prefill={prefill?.sourceKey === selected.sourceKey ? prefill : null}
 
     onClose={() => { setSelected(null); setPrefill(null); }} onSaved={async (text) => {
       setMessage(text); setSelected(null); setPrefill(null);
       if (await refreshReport()) clearDrafts([selected.sourceKey]);
     }} />}
    </div>
  );
}

function ReviewEditor({ row, weekStart, prefill, onClose, onSaved }: {
  row: ReviewRow; weekStart: string; prefill: { sourceKey: string; periods: PayablePeriod[]; breakMinutes: number; reason: string } | null;
  onClose: () => void; onSaved: (message: string) => void;
}) {
  const [periods, setPeriods] = useState(prefill?.periods || row.periods);
  const [breakMinutes, setBreakMinutes] = useState(prefill?.breakMinutes ?? row.breakMinutes);
  const [reason, setReason] = useState(prefill?.reason || row.reason);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const locked = row.status === 'APPROVED';
  const dirty = JSON.stringify(periods) !== JSON.stringify(row.periods) ||
    breakMinutes !== row.breakMinutes || reason !== row.reason;
  useEffect(() => {
    // A native modal traps focus and makes the filters/table inert while editing,
    // preventing keyboard navigation from discarding an unsaved review.
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  // Browser/tab closure and the explicit Close action both protect unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);

  const close = () => {
    if (!busy && (!dirty || window.confirm('Discard unsaved timesheet changes?'))) onClose();
  };
  const changePeriod = (index: number, field: keyof PayablePeriod, value: string) =>
    setPeriods((current) => current.map((period, i) =>
      i === index ? editPeriodTime(period, field, value, row.workDate) : period));
  const hours = paidHours(periods, breakMinutes);
  const blocked = approvalError(row, periods);
  const submit = async (action: 'SAVE' | 'APPROVE') => {
    setError('');
    try {
      const isOnlyBreakChange = samePeriods(periods, actualPeriods(row.actual)) &&
        row.actual.length > 0 && !row.ambiguous && !row.inProgress;
      validatePayable(periods, breakMinutes, row.workDate);
      if (action === 'APPROVE' && blocked) throw new Error(blocked);
      setBusy(true);
      const effectiveReason = reason.trim() || (isOnlyBreakChange ? 'Break adjusted' : 'Hours adjusted by admin');

      const res = await fetch('/api/admin/reports/timesheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceKey: row.sourceKey, weekStart, version: row.version, snapshot: row.snapshot,
          action, periods, breakMinutes, reason: effectiveReason,
        }),
      });
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`Save failed (${res.status}). Please sign in again.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      onSaved(data.message);
    } catch (err) {
      console.error('Timesheet review action failed:', err);
      setError(err instanceof Error ? err.message : 'Unable to save timesheet.');
    } finally {
      setBusy(false);
    }
  };

  return <dialog ref={dialog} aria-labelledby="review-title" onCancel={(event) => { event.preventDefault(); close(); }}
      className="admin-responsive-form m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 text-stone-900 shadow-xl backdrop:bg-black/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 break-words"><h2 id="review-title" className="text-xl font-semibold">{row.staffName}: {formatDMY(row.workDate)}</h2>
          <p className="text-sm text-stone-500">{row.site} · {status(row)}{dirty ? ' · Unsaved changes' : ''}</p></div>
        <button autoFocus onClick={close} disabled={busy} className={buttonClass}>Close</button>
      </div>
      <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm">
        <h3 className="font-semibold">Actual hours</h3>
        
        {row.actual.length ? row.actual.map((log) => <p key={log.id} className="mt-1">
          {time(log.clockIn)}{dayHint(log.clockIn, row.workDate)} – {log.clockOut ?
            `${time(log.clockOut)}${dayHint(log.clockOut, row.workDate)}` : 'Still clocked in'}
        </p>) : <p>No clock-in/out record.</p>}
        <div className="mt-1 text-stone-500">Break: <PayrollBreakStatus row={row} /></div>
        {row.exceptions.filter((exception) => exception !== 'No attendance recorded' &&
          !exception.startsWith('Break not recorded:')).map((exception) =>
          <p key={exception} className="mt-1 text-amber-800">{exception}</p>)}
      </div>
      {locked && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          ✓ Approved{row.approvedBy ? ` by ${row.approvedBy}` : ''}{row.approvedAt ? ` · ${formatDMY(perthDate(row.approvedAt))} ${time(row.approvedAt)}` : ''}. You can still edit and save again.
        </p>
      )}
      <fieldset disabled={busy} className="mt-5 space-y-3">
        <legend className="font-semibold">Payable hours</legend>
        {periods.map((period, index) => <div key={index} className="grid min-w-0 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-1 text-sm">Start{dayHint(period.start, row.workDate)}
            <input type="time" step="60" value={timeInput(period.start)}
              onChange={(e) => changePeriod(index, 'start', e.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm">End{dayHint(period.end, row.workDate)}
            <input type="time" step="60" value={timeInput(period.end)}
              onChange={(e) => changePeriod(index, 'end', e.target.value)} className={inputClass} />
          </label>
          <button onClick={() => setPeriods((values) => values.filter((_, i) => i !== index))} className={buttonClass}>Remove</button>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPeriods((values) => [...values, { start: '', end: '' }])}
            disabled={periods.length >= 20 || busy} className={buttonClass}>Add period</button>
          {row.actual.length > 0 && <button onClick={() => {
            const actual = actualPeriods(row.actual);
            setPeriods(actual);
            setBreakMinutes(actual.length ? row.actualBreakMinutes ?? row.scheduledBreakMinutes : 0);
          }} className={buttonClass}>Use actual hours</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <label className="grid content-start gap-1 text-sm">Break (min)
            <input type="number" min="0" step="1" value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))} className={inputClass} />
          </label>
        </div>
        {(row.ambiguous || row.inProgress) && <label className="grid gap-1 text-sm">
          Explanation (optional)
          <textarea value={reason} maxLength={2000}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain the verified hours."
            className={inputClass} />
        </label>}
      </fieldset>
      <p className="mt-4 font-semibold">Total: {Number.isFinite(hours) && hours >= 0 ? hours.toFixed(2) : '--'} hours</p>
      {blocked && <p className="mt-2 text-sm text-amber-800">{blocked}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
          <>
            <button onClick={() => submit('SAVE')} disabled={busy} className={buttonClass}>Save changes</button>
            <button onClick={() => submit('APPROVE')} disabled={busy || Boolean(blocked)}
              className={`${buttonClass} bg-emerald-700 text-white`}>Save &amp; approve</button>
          </>
        {busy && <span role="status" className="self-center text-sm">Saving...</span>}
      </div>
      {row.history.length > 0 && <details className="mt-6 border-t border-stone-200 pt-3">
        <summary className="cursor-pointer font-semibold">Review history ({row.history.length})</summary>
        {row.history.map((entry, index) => <div key={index} className="mt-3 rounded-lg bg-stone-50 p-3 text-sm">
          <p>{entry.action} by {entry.actor} · {formatDMY(perthDate(entry.at))} {time(entry.at)}</p>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(entry.values, null, 2)}</pre>
        </div>)}
      </details>}
  </dialog>;
}
