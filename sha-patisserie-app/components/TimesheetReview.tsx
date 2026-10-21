'use client';

import { useEffect, useRef, useState } from 'react';
import {
  actualPeriods, approvalError, csvCell, currentWeek, editPeriodTime, perthDate, timeInput,
  paidHours, requiresReason, samePeriods, validatePayable,
  type PayablePeriod, type PayrollRow, type ReviewRow,
  ATTENDANCE_OPTIONS, employmentLabel,
} from '@/lib/timesheets';

interface Report {
  leaveRows?: { id: string; userId: string; staffName: string; employmentType: string | null; site: string; date: string; type: string; hours: number }[];
  shifts: ReviewRow[];
  rows: PayrollRow[];
  excludedCount: number;
  approvedCount: number;
  venues?: string[];
}

interface WeekDay {
  dateStr: string;
  dayLetter: string;
  dayShort: string;
  displayDate: string;
}

const time = (value: string) => new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

const timeShort = (value: string) => {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d).split(':');
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
      const displayDate = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Perth',
        month: 'short',
        day: 'numeric',
      }).format(new Date(`${dateStr}T12:00:00+08:00`));

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

const inputClass = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm disabled:bg-stone-100';
const buttonClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50';

export default function TimesheetReview() {
  const [tab, setTab] = useState<'confirm' | 'payroll'>('confirm');
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [venue, setVenue] = useState('');
  const [staff, setStaff] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [savingBatch, setSavingBatch] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    // Clear stale data before a new week loads: an old approval/export must never
    // be presented as belonging to the newly selected payroll week.
    async function load() {
      setLoading(true);
      setError('');
      setReport(null);
      try {
        const res = await fetch(`/api/admin/reports?weekStart=${encodeURIComponent(weekStart)}`, {
          signal: controller.signal, cache: 'no-store',
        });
        if (!res.headers.get('content-type')?.includes('application/json')) {
          throw new Error(`Reports request failed (${res.status}). Please sign in again.`);
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load reports.');
        if (!controller.signal.aborted) {
          setReport(data);
          // Initialize adjustments from loaded shifts
          const initialAdjustments: Record<string, number> = {};
          (data.shifts || []).forEach((row: ReviewRow) => {
            const currentHours = paidHours(row.periods, row.breakMinutes);
            initialAdjustments[row.sourceKey] = Number(currentHours.toFixed(2));
          });
          setAdjustments(initialAdjustments);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to load timesheets:', err);
        setError(err instanceof Error ? err.message : 'Unable to load reports.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [weekStart, refresh]);

  const shifts = report?.shifts ?? [];
  const weekDays = getWeekDays(weekStart);

  const filtered = shifts.filter((row) => (!venue || row.site === venue) &&
    (!staff || row.userId === staff) && (!statusFilter || status(row) === statusFilter));
  const payroll = (report?.rows ?? []).filter((row) =>
    (!venue || row.site === venue) && (!staff || row.userId === staff));
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
  const totalGross = payroll.reduce((sum, row) => sum + row.gross, 0);

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
      setRefresh((value) => value + 1);
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
        // Skip in-progress shifts
        if (row.inProgress) return false;
        return true;
      });

      if (!targetRows.length) {
        throw new Error('No completed timesheets to approve.');
      }

      const batchItems = targetRows.map((row) => {
        const adjustedVal = adjustments[row.sourceKey] !== undefined
          ? adjustments[row.sourceKey]
          : paidHours(row.periods, row.breakMinutes);

        let periods: PayablePeriod[] = [];
        if (adjustedVal > 0) {
          const start = row.actual[0]?.clockIn || row.periods[0]?.start || `${row.workDate}T09:00:00+08:00`;
          const breakMinutes = row.breakMinutes;
          const totalMins = Math.round(adjustedVal * 60 + breakMinutes);
          const newEnd = new Date(new Date(start).getTime() + totalMins * 60000).toISOString();
          periods = [{ start, end: newEnd }];
        }

        const isAdjusted = adjustedVal !== paidHours(row.periods, row.breakMinutes);
        const reason = isAdjusted
          ? `Adjusted to ${adjustedVal.toFixed(2)}h in weekly consolidation`
          : row.reason || 'Weekly timesheet approved';

        return {
          sourceKey: row.sourceKey,
          weekStart,
          version: row.version,
          snapshot: row.snapshot,
          action: 'APPROVE' as const,
          breakMinutes: row.breakMinutes,
          periods,
          reason,
        };
      });

      const res = await fetch('/api/admin/reports/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: batchItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve timesheets.');

      setMessage(data.message || 'Timesheets successfully approved and saved!');
      setRefresh((v) => v + 1);
    } catch (err) {
      console.error('Batch approval failed:', err);
      setError(err instanceof Error ? err.message : 'Error approving timesheets.');
    } finally {
      setSavingBatch(false);
    }
  };

  // Reopen approval for a staff member
  const handleReopenStaff = async (targetUserId: string) => {
    setError('');
    setMessage('');
    setSavingBatch(true);

    try {
      const targetRows = filtered.filter((row) => row.userId === targetUserId && row.status === 'APPROVED');
      if (!targetRows.length) throw new Error('No approved timesheets found to reopen.');

      const batchItems = targetRows.map((row) => ({
        sourceKey: row.sourceKey,
        weekStart,
        version: row.version,
        snapshot: row.snapshot,
        action: 'REOPEN' as const,
        breakMinutes: row.breakMinutes,
        periods: row.periods,
        reason: 'Reopened by manager during weekly review',
      }));

      const res = await fetch('/api/admin/reports/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: batchItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reopen timesheets.');

      setMessage('Timesheets reopened for editing.');
      setRefresh((v) => v + 1);
    } catch (err) {
      console.error('Reopen failed:', err);
      setError(err instanceof Error ? err.message : 'Error reopening timesheets.');
    } finally {
      setSavingBatch(false);
    }
  };

  const download = () => {
    const leave = (report?.leaveRows || []).filter((row) => (!venue || row.site === venue) && (!staff || row.userId === staff));
    const lines = [
      ['Staff Member', 'Employment Status', 'Site', 'Rate ($/hr)', 'Approved Hours', 'Leave Hours', 'Leave Type', 'Leave Date', 'Gross ($)'],
      ...payroll.map((row) => [row.staffName, employmentLabel(row.employmentType), row.site, row.rate.toFixed(2), row.totalHours.toFixed(2), '', '', '', row.gross.toFixed(2)]),
      ...leave.map((row) => [row.staffName, employmentLabel(row.employmentType), row.site, '', '0.00', row.hours.toFixed(2), row.type, row.date, '0.00']),
    ].map((line) => line.map(csvCell).join(',')).join('\r\n');
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

        {tab === 'confirm' && consolidatedStaffList.length > 0 && (
          <button
            onClick={() => handleSaveAndApprove()}
            disabled={savingBatch || loading}
            className="self-start sm:self-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {savingBatch ? 'Processing...' : 'Save and Approved All'}
          </button>
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
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-stone-200 bg-white p-4">
        <label className="grid gap-1 text-sm font-medium">
          Week starting Monday
          <input
            type="date"
            value={weekStart}
            onChange={(e) => {
              setWeekStart(e.target.value);
              setMessage('');
              setVenue('');
              setStaff('');
            }}
            className={inputClass}
          />
        </label>
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
                {name}
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
        <button onClick={() => setRefresh((value) => value + 1)} disabled={loading} className={buttonClass}>
          Refresh
        </button>
        {tab === 'payroll' && (
          <button
            onClick={download}
            disabled={loading || (payroll.length === 0 && !(report?.leaveRows || []).some((row) => (!venue || row.site === venue) && (!staff || row.userId === staff)))}
            className={`${buttonClass} bg-stone-900 text-white`}
          >
            Download approved CSV
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-200">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">{message}</p>}

      {/* Metric Cards */}
      {report && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Staff with shifts thisweek', consolidatedStaffList.length],
            ['Awaiting approval / pending', shifts.filter((row) => row.status !== 'APPROVED').length],
            ['Approved hours (selected venue/staff)', `${totalHours.toFixed(2)} h`],
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

          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px]">
                  <th className="p-3 font-bold min-w-[140px]">Staff Member</th>
                  {weekDays.map((d) => (
                    <th key={d.dateStr} className="p-3 text-center min-w-[125px] border-l border-stone-200/60">
                      <div className="font-extrabold text-sm text-stone-800">{d.dayLetter}</div>
                      <div className="text-[10px] text-stone-500 font-normal">{d.displayDate}</div>
                    </th>
                  ))}
                  <th className="p-3 text-right min-w-[130px] border-l border-stone-200/60 font-bold">
                    Final Total (Hours)
                  </th>
                  <th className="p-3 text-center min-w-[130px] border-l border-stone-200/60 font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {consolidatedStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-stone-500 text-sm">
                      No actual clock records found for this week.
                    </td>
                  </tr>
                ) : (
                  consolidatedStaffList.map((staffItem) => {
                    // Compute final total of adjusted hours for this staff member
                    const finalStaffTotal = weekDays.reduce((acc, d) => {
                      const row = staffItem.shiftMap.get(d.dateStr);
                      if (!row) return acc;
                      const val = adjustments[row.sourceKey] !== undefined
                        ? adjustments[row.sourceKey]
                        : paidHours(row.periods, row.breakMinutes);
                      return acc + (Number.isFinite(val) ? val : 0);
                    }, 0);

                    // Check if all shifts are approved
                    const staffShifts = Array.from(staffItem.shiftMap.values());
                    const isAllApproved = staffShifts.length > 0 && staffShifts.every((s) => s.status === 'APPROVED');
                    const hasInProgress = staffShifts.some((s) => s.inProgress);

                    return (
                      <tr key={staffItem.userId} className="border-b border-stone-200 hover:bg-stone-50/50">
                        {/* Staff Name & Site */}
                        <td className="p-3.5 align-top">
                          <p className="font-bold text-stone-900 text-sm">{staffItem.staffName}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-stone-600">{employmentLabel(staffItem.employmentType)}</p>
                          <p className="text-stone-500 text-[11px] mt-0.5">{staffItem.site}</p>
                          {staffItem.rate !== null && (
                            <p className="text-stone-400 text-[10px] mt-0.5">${staffItem.rate.toFixed(2)} / hr</p>
                          )}
                        </td>

                        {/* Monday to Sunday Columns */}
                        {weekDays.map((d) => {
                          const row = staffItem.shiftMap.get(d.dateStr);

                          if (!row) {
                            return (
                              <td
                                key={d.dateStr}
                                className="p-3 text-center align-middle border-l border-stone-200/60 bg-stone-50/30 text-stone-300 select-none"
                              >
                                —
                              </td>
                            );
                          }

                          const firstLog = row.actual[0];
                          const clockInTime = firstLog ? timeShort(firstLog.clockIn) : '—';
                          const clockOutTime = firstLog?.clockOut ? timeShort(firstLog.clockOut) : null;
                          const breakMin = row.actualBreakMinutes ?? row.breakMinutes ?? 0;
                          const rawComputedHours = paidHours(row.periods, row.breakMinutes);
                          const adjVal = adjustments[row.sourceKey] !== undefined
                            ? adjustments[row.sourceKey]
                            : Number(rawComputedHours.toFixed(2));

                          return (
                            <td
                              key={d.dateStr}
                              className={`p-2.5 align-top border-l border-stone-200/60 ${
                                row.status === 'APPROVED' ? 'bg-emerald-50/20' : 'bg-white'
                              }`}
                            >
                              <div className="space-y-1 text-[11px]">
                                <select
                                  aria-label={`Attendance for ${row.staffName} on ${row.workDate}`}
                                  value={row.attendanceStatus || 'UNCLASSIFIED'}
                                  disabled={row.status === 'APPROVED' || savingBatch || row.inProgress}
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
                                      {row.actual.length ? 'In progress' : 'No clock record'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">Break:</span>
                                  <span className="text-stone-700">{breakMin}m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold text-stone-500">Total:</span>
                                  <span className="font-semibold text-stone-900">
                                    {row.inProgress ? 'In prog.' : `${rawComputedHours.toFixed(2)}h`}
                                  </span>
                                </div>

                                {/* Yellow Adjustment Total Hour Input */}
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-stone-600">Adj:</span>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="24"
                                    disabled={row.inProgress || savingBatch}
                                    value={Number.isFinite(adjVal) ? adjVal : ''}
                                    onChange={(e) =>
                                      handleAdjustmentChange(row.sourceKey, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 rounded border border-amber-400 bg-[#fef08a] px-1.5 py-0.5 text-center font-bold text-stone-900 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                                  />
                                </div>

                                <div className="text-right pt-0.5">
                                  <button
                                    onClick={() => setSelected(row)}
                                    className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* Final Weekly Total */}
                        <td className="p-3 text-right align-middle border-l border-stone-200/60">
                          <p className="text-base font-extrabold text-stone-900 font-mono">
                            {finalStaffTotal.toFixed(2)}
                          </p>
                          <p className="text-[10px] font-semibold uppercase text-stone-500">hrs</p>
                        </td>

                        {/* Single Save & Approved Action Button per Staff */}
                        <td className="p-3 text-center align-middle border-l border-stone-200/60">
                          {isAllApproved ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <span>✓</span> Approved
                              </span>
                              <button
                                onClick={() => handleReopenStaff(staffItem.userId)}
                                disabled={savingBatch}
                                className="w-full rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2 py-1 text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                                title="Unlock to modify hours or breaks"
                              >
                                <span>✏️</span> Modify / Unlock
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSaveAndApprove(staffItem.userId)}
                              disabled={savingBatch || hasInProgress}
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 text-xs shadow-sm disabled:opacity-40 transition-all"
                            >
                              Save and Approved
                            </button>
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
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
            {report.excludedCount} timesheet(s) are unapproved or no longer valid and excluded from this week&apos;s payroll.
            Rates are captured at approval. This is gross pay only, not an award/overtime calculation.
          </p>
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-bold uppercase text-stone-500">
                <tr>
                  {['Staff', 'Venue', 'Approved rate', 'Approved hours', 'Gross'].map((label) => (
                    <th key={label} className="p-4">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!payroll.length ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-500">
                      No approved payable hours for this selection.
                    </td>
                  </tr>
                ) : (
                  payroll.map((row) => (
                    <tr key={row.key} className="border-t border-stone-100">
                      <td className="p-4 font-semibold">{row.staffName}<span className="block text-xs font-normal text-stone-500">{employmentLabel(row.employmentType)}</span></td>
                      <td className="p-4 text-stone-600">{row.site}</td>
                      <td className="p-4 font-mono">${row.rate.toFixed(2)}</td>
                      <td className="p-4 font-mono font-bold">{row.totalHours.toFixed(2)} h</td>
                      <td className="p-4 font-mono font-bold text-emerald-800">${row.gross.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t bg-stone-50 font-semibold">
                <tr>
                  <td colSpan={3} className="p-4">Total</td>
                  <td className="p-4 font-mono font-extrabold">{totalHours.toFixed(2)} h</td>
                  <td className="p-4 font-mono font-extrabold text-emerald-900">${totalGross.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <h2 className="pt-4 text-lg font-semibold">Approved Leave</h2>
          <div className="overflow-x-auto border-t border-stone-200">
            <table className="w-full text-left text-sm">
              <thead><tr>{['Staff / employment', 'Date', 'Leave type', 'Leave hours'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
              <tbody>{(report.leaveRows || []).filter((row) => (!venue || row.site === venue) && (!staff || row.userId === staff)).map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="p-3">{row.staffName}<span className="block text-xs text-stone-500">{employmentLabel(row.employmentType)}</span></td>
                  <td className="p-3">{row.date}</td><td className="p-3">{row.type}</td><td className="p-3">{row.hours.toFixed(2)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {selected && <ReviewEditor key={`${selected.sourceKey}:${selected.version}`} row={selected} weekStart={weekStart}
        onClose={() => setSelected(null)} onSaved={(text) => {
          setMessage(text); setSelected(null); setRefresh((value) => value + 1);
        }} />}
    </div>
  );
}

function ReviewEditor({ row, weekStart, onClose, onSaved }: {
  row: ReviewRow; weekStart: string; onClose: () => void; onSaved: (message: string) => void;
}) {
  const [periods, setPeriods] = useState(row.periods);
  const [breakMinutes, setBreakMinutes] = useState(row.breakMinutes);
  const [reason, setReason] = useState(row.reason);
  const [reopenReason, setReopenReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const locked = row.status === 'APPROVED';
  const dirty = JSON.stringify(periods) !== JSON.stringify(row.periods) ||
    breakMinutes !== row.breakMinutes || reason !== row.reason || Boolean(reopenReason);
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
  const submit = async (action: 'SAVE' | 'APPROVE' | 'REOPEN') => {
    setError('');
    try {
      const isOnlyBreakChange = samePeriods(periods, actualPeriods(row.actual));
      if (action !== 'REOPEN') {
        validatePayable(periods, breakMinutes, row.workDate);
        if (!isOnlyBreakChange && requiresReason(row, periods, breakMinutes) && !reason.trim()) {
          throw new Error('Explain adjusted times, missing attendance or unscheduled work.');
        }
        if (action === 'APPROVE' && blocked) throw new Error(blocked);
      }
      setBusy(true);
      const effectiveReason = action === 'REOPEN'
        ? (reopenReason.trim() || 'Reopened by manager for modification')
        : (reason.trim() || (isOnlyBreakChange ? 'Break adjusted' : 'Hours adjusted by manager'));

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
      className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-stone-900 shadow-xl backdrop:bg-black/40">
      <div className="flex items-start justify-between gap-4">
        <div><h2 id="review-title" className="text-xl font-semibold">{row.staffName}: {row.workDate}</h2>
          <p className="text-sm text-stone-500">{row.site} · {status(row)}{dirty ? ' · Unsaved changes' : ''}</p></div>
        <button autoFocus onClick={close} disabled={busy} className={buttonClass}>Close</button>
      </div>
      <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm">
        <h3 className="font-semibold">Actual hours</h3>
        {row.actual.length ? row.actual.map((log) => <p key={log.id} className="mt-1">
          {time(log.clockIn)}{dayHint(log.clockIn, row.workDate)} – {log.clockOut ?
            `${time(log.clockOut)}${dayHint(log.clockOut, row.workDate)}` : 'Still clocked in'}
        </p>) : <p>No clock-in/out record.</p>}
        <p className="mt-1 text-stone-500">Break: {row.actualBreakMinutes === null ? 'Not recorded' : `${row.actualBreakMinutes} min`}</p>
        {row.exceptions.filter((exception) => exception !== 'No attendance recorded' &&
          !exception.startsWith('Break not recorded:')).map((exception) =>
          <p key={exception} className="mt-1 text-amber-800">{exception}</p>)}
      </div>
      {locked && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-bold text-emerald-900">✓ Timesheet is Approved</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {row.approvedBy ? `Approved by ${row.approvedBy} · ` : ''}
                {row.approvedAt ? `${perthDate(row.approvedAt)} ${time(row.approvedAt)} · ` : ''}
                Click Unlock to modify hours or breaks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => submit('REOPEN')}
              disabled={busy}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              {busy ? 'Unlocking...' : '✏️ Unlock to Modify'}
            </button>
          </div>
        </div>
      )}
      <fieldset disabled={busy || locked} className="mt-5 space-y-3">
        <legend className="font-semibold">Payable hours</legend>
        {periods.map((period, index) => <div key={index} className="flex flex-wrap items-end gap-3">
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
            disabled={periods.length >= 20 || busy || locked} className={buttonClass}>Add period</button>
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
      </fieldset>
      <p className="mt-4 font-semibold">Total: {Number.isFinite(hours) && hours >= 0 ? hours.toFixed(2) : '--'} hours</p>
      {!locked && blocked && <p className="mt-2 text-sm text-amber-800">{blocked}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {locked ? (
          <button
            onClick={() => submit('REOPEN')}
            disabled={busy}
            className="rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 transition-colors"
          >
            {busy ? 'Unlocking...' : '✏️ Unlock to Modify Timesheet'}
          </button>
        ) : (
          <>
            <button onClick={() => submit('SAVE')} disabled={busy} className={buttonClass}>Save changes</button>
            <button onClick={() => submit('APPROVE')} disabled={busy || Boolean(blocked)}
              className={`${buttonClass} bg-emerald-700 text-white`}>Save &amp; approve</button>
          </>
        )}
        {busy && <span role="status" className="self-center text-sm">Saving...</span>}
      </div>
      {row.history.length > 0 && <details className="mt-6 border-t border-stone-200 pt-3">
        <summary className="cursor-pointer font-semibold">Review history ({row.history.length})</summary>
        {row.history.map((entry, index) => <div key={index} className="mt-3 rounded-lg bg-stone-50 p-3 text-sm">
          <p>{entry.action} by {entry.actor} · {perthDate(entry.at)} {time(entry.at)}</p>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(entry.values, null, 2)}</pre>
        </div>)}
      </details>}
  </dialog>;
}
