'use client';

import { useEffect, useRef, useState } from 'react';
import {
  actualPeriods, approvalError, csvCell, currentWeek, inputTimestamp, localInput,
  paidHours, requiresReason, validatePayable,
  type PayablePeriod, type PayrollRow, type ReviewRow,
} from '@/lib/timesheets';

interface Report {
  shifts: ReviewRow[];
  rows: PayrollRow[];
  excludedCount: number;
  approvedCount: number;
}

const time = (value: string) => new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth', day: '2-digit', month: 'short',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).format(new Date(value));

const status = (row: ReviewRow) => row.sourceChanged ? 'Needs attention' :
  row.status === 'APPROVED' ? 'Approved' : row.needsAttention ? 'Needs attention' : 'Pending review';

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
        if (!controller.signal.aborted) setReport(data);
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
  const filtered = shifts.filter((row) => (!venue || row.site === venue) &&
    (!staff || row.userId === staff) && (!statusFilter || status(row) === statusFilter));
  const payroll = (report?.rows ?? []).filter((row) =>
    (!venue || row.site === venue) && (!staff || row.userId === staff));
  const sites = [...new Set(shifts.map((row) => row.site))].sort();
  const people = [...new Map(shifts.map((row) => [row.userId, row.staffName])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]));
  const totalHours = payroll.reduce((sum, row) => sum + row.totalHours, 0);
  const totalGross = payroll.reduce((sum, row) => sum + row.gross, 0);

  const download = () => {
    const lines = [
      ['Staff Member', 'Site', 'Rate ($/hr)', 'Approved Hours', 'Gross ($)'],
      ...payroll.map((row) => [row.staffName, row.site, row.rate.toFixed(2), row.totalHours.toFixed(2), row.gross.toFixed(2)]),
    ].map((line) => line.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved-payroll-${weekStart}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-stone-900">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin reports</p>
        <h1 className="mt-1 text-3xl font-serif">Worked hours &amp; payroll</h1>
        <p className="mt-2 text-sm text-stone-600">
          Original attendance is read-only. Save payable adjustments, then approve them for payroll. All times are Perth (UTC+08).
        </p>
      </header>
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Report sections">
        <button role="tab" aria-selected={tab === 'confirm'} onClick={() => setTab('confirm')}
          className={`${buttonClass} ${tab === 'confirm' ? 'bg-stone-900 text-white' : 'bg-white'}`}>Confirm Worked Hours</button>
        <button role="tab" aria-selected={tab === 'payroll'} onClick={() => setTab('payroll')}
          className={`${buttonClass} ${tab === 'payroll' ? 'bg-stone-900 text-white' : 'bg-white'}`}>Payroll Summary</button>
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-stone-200 bg-white p-4">
        <label className="grid gap-1 text-sm">Week starting Monday
          <input type="date" value={weekStart} onChange={(e) => {
            setWeekStart(e.target.value); setMessage(''); setVenue(''); setStaff('');
          }} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">Venue
          <select value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass}>
            <option value="">All venues</option>
            {sites.map((site) => <option key={site}>{site}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">Staff
          <select value={staff} onChange={(e) => setStaff(e.target.value)} className={inputClass}>
            <option value="">All staff</option>
            {people.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        {tab === 'confirm' && <label className="grid gap-1 text-sm">Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
            <option value="">All statuses</option>
            {['Pending review', 'Needs attention', 'Approved'].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>}
        <button onClick={() => setRefresh((value) => value + 1)} disabled={loading} className={buttonClass}>Refresh</button>
        {tab === 'payroll' && <button onClick={download} disabled={loading || payroll.length === 0}
          className={`${buttonClass} bg-stone-900 text-white`}>Download approved CSV</button>}
      </div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{message}</p>}
      {report && <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Awaiting approval / excluded', report.excludedCount],
          ['Needs attention', shifts.filter((row) => status(row) === 'Needs attention').length],
          ['Approved hours (selected venue/staff)', `${totalHours.toFixed(2)} h`],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>)}
      </div>}
      {loading ? <p role="status">Loading timesheets...</p> : report && tab === 'confirm' ? (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>{['Staff / date', 'Scheduled', 'Actual attendance', 'Payable hours', 'Status / exceptions', 'Review'].map((title) =>
                <th key={title} className="p-4">{title}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-stone-500">No timesheets match this selection.</td></tr>}
              {filtered.map((row) => <tr key={row.sourceKey} className="border-t border-stone-100 align-top">
                <td className="p-4"><p className="font-semibold">{row.staffName}</p><p>{row.workDate}</p><p className="text-xs text-stone-500">{row.site}</p></td>
                <td className="p-4 text-xs">{row.scheduledStart && row.scheduledEnd ?
                  <>{time(row.scheduledStart)}<br />to {time(row.scheduledEnd)}</> : 'Unscheduled'}</td>
                <td className="p-4 text-xs">
                  {row.actual.length ? row.actual.map((log) => <p key={log.id} className="mb-2">
                    {time(log.clockIn)}<br />to {log.clockOut ? time(log.clockOut) : 'Still clocked in'}
                  </p>) : 'No clock record'}
                  <p className="text-stone-500">Recorded break: {row.actualBreakMinutes === null ? 'Not recorded' : `${row.actualBreakMinutes} min`}</p>
                </td>
                <td className="p-4">
                  <p className="font-semibold">{Number.isFinite(paidHours(row.periods, row.breakMinutes)) && paidHours(row.periods, row.breakMinutes) >= 0 ?
                    paidHours(row.periods, row.breakMinutes).toFixed(2) : '--'} h</p>
                  <p className="text-xs text-stone-500">{row.periods.length} period(s), {row.breakMinutes} min deduction</p>
                </td>
                <td className="p-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${status(row) === 'Approved' ?
                  'bg-emerald-100 text-emerald-800' : status(row) === 'Needs attention' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100'}`}>{status(row)}</span>
                  {row.exceptions.map((exception) => <p key={exception} className="mt-2 text-xs text-stone-600">{exception}</p>)}
                </td>
                <td className="p-4"><button className={buttonClass} onClick={() => { setMessage(''); setSelected(row); }}>Review / Edit</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      ) : report && <div className="space-y-3">
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {report.excludedCount} timesheet(s) are unapproved or no longer valid and excluded from this week&apos;s payroll.
          Rates are captured at approval. This is gross pay only, not an award/overtime calculation.
        </p>
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50"><tr>{['Staff', 'Venue', 'Approved rate', 'Approved hours', 'Gross'].map((label) => <th key={label} className="p-4">{label}</th>)}</tr></thead>
            <tbody>
              {!payroll.length && <tr><td colSpan={5} className="p-6 text-center">No approved payable hours for this selection.</td></tr>}
              {payroll.map((row) => <tr key={row.key} className="border-t border-stone-100">
                <td className="p-4">{row.staffName}</td><td className="p-4">{row.site}</td>
                <td className="p-4">${row.rate.toFixed(2)}</td><td className="p-4">{row.totalHours.toFixed(2)}</td><td className="p-4">${row.gross.toFixed(2)}</td>
              </tr>)}
            </tbody>
            <tfoot className="border-t bg-stone-50 font-semibold"><tr>
              <td colSpan={3} className="p-4">Total</td><td className="p-4">{totalHours.toFixed(2)}</td><td className="p-4">${totalGross.toFixed(2)}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>}
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
    setPeriods((current) => current.map((period, i) => i === index ? { ...period, [field]: inputTimestamp(value) } : period));
  const hours = paidHours(periods, breakMinutes);
  const blocked = approvalError(row, periods);
  const submit = async (action: 'SAVE' | 'APPROVE' | 'REOPEN') => {
    setError('');
    try {
      if (action !== 'REOPEN') {
        validatePayable(periods, breakMinutes, row.workDate);
        if (requiresReason(row, periods, breakMinutes) && !reason.trim()) {
          throw new Error('Explain adjusted times, missing attendance or unscheduled work.');
        }
        if (action === 'APPROVE' && blocked) throw new Error(blocked);
      } else if (!reopenReason.trim()) {
        throw new Error('Enter a reason for reopening this approval.');
      }
      setBusy(true);
      const res = await fetch('/api/admin/reports/timesheets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceKey: row.sourceKey, weekStart, version: row.version, snapshot: row.snapshot,
          action, periods, breakMinutes, reason: action === 'REOPEN' ? reopenReason : reason,
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
        <h3 className="font-semibold">Original attendance (read-only)</h3>
        {row.actual.length ? row.actual.map((log) => <p key={log.id} className="mt-1">
          {time(log.clockIn)} to {log.clockOut ? time(log.clockOut) : 'Still clocked in'}
        </p>) : <p>No clock-in/out record. Do not treat the roster as proof of attendance.</p>}
        <p className="mt-1">Recorded break: {row.actualBreakMinutes === null ? 'Not recorded' : `${row.actualBreakMinutes} minutes`}</p>
        {row.actualBreakMinutes === null && <p className="mt-1">
          Roster break deduction: {row.scheduledBreakMinutes} minutes. Verify it and explain any deduction without a recorded break.
        </p>}
        {row.exceptions.map((exception) => <p key={exception} className="mt-1 text-amber-800">{exception}</p>)}
      </div>
      {row.approvedAt && <p className="mt-3 text-sm text-emerald-800">Approved by {row.approvedBy} at {time(row.approvedAt)}.</p>}
      <fieldset disabled={busy || locked} className="mt-5 space-y-3">
        <legend className="font-semibold">Payable periods (Perth time, including date)</legend>
        <p className="text-xs text-stone-500">
          Separate periods exclude clock-out gaps. Deduct only breaks not already excluded between periods.
          Remove all periods and set break to 0 for a confirmed absence with zero pay.
        </p>
        {periods.map((period, index) => <div key={index} className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">Start {index + 1}
            <input type="datetime-local" step="1" value={period.start ? localInput(period.start) : ''}
              onChange={(e) => changePeriod(index, 'start', e.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm">End {index + 1}
            <input type="datetime-local" step="1" value={period.end ? localInput(period.end) : ''}
              onChange={(e) => changePeriod(index, 'end', e.target.value)} className={inputClass} />
          </label>
          <button onClick={() => setPeriods((values) => values.filter((_, i) => i !== index))} className={buttonClass}>Remove</button>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPeriods((values) => [...values, { start: '', end: '' }])}
            disabled={periods.length >= 20 || busy || locked} className={buttonClass}>Add payable period</button>
          <button onClick={() => {
            const actual = actualPeriods(row.actual);
            setPeriods(actual); setBreakMinutes(actual.length ? row.actualBreakMinutes ?? row.scheduledBreakMinutes : 0);
          }}
            className={buttonClass}>Reset periods / break suggestion</button>
        </div>
        <label className="grid max-w-xs gap-1 text-sm">Payable break deduction (minutes)
          <input type="number" min="0" step="1" value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">Adjustment / review reason
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000}
            rows={3} className={inputClass} placeholder="Required for corrections, missing attendance and unscheduled work." />
        </label>
      </fieldset>
      <p className="mt-4 font-semibold">Payable total: {Number.isFinite(hours) && hours >= 0 ? hours.toFixed(2) : '--'} hours</p>
      {!locked && blocked && <p className="mt-2 text-sm text-amber-800">{blocked}</p>}
      {locked && <label className="mt-4 grid gap-1 text-sm">Reason for reopening
        <textarea value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} disabled={busy}
          maxLength={2000} className={inputClass} placeholder="Reopening removes these hours from payroll until approved again." />
      </label>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-rose-800">{error} Close and refresh if the record changed.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {locked ? <button onClick={() => submit('REOPEN')} disabled={busy} className={`${buttonClass} bg-amber-50`}>Reopen for correction</button> : <>
          <button onClick={() => submit('SAVE')} disabled={busy} className={buttonClass}>Save changes</button>
          <button onClick={() => submit('APPROVE')} disabled={busy || Boolean(blocked)}
            className={`${buttonClass} bg-emerald-700 text-white`}>Save &amp; approve</button>
        </>}
        {busy && <span role="status" className="self-center text-sm">Saving...</span>}
      </div>
      <details className="mt-6 border-t border-stone-200 pt-3">
        <summary className="cursor-pointer font-semibold">Review history ({row.history.length})</summary>
        {!row.history.length && <p className="mt-2 text-sm">No saved reviews yet.</p>}
        {row.history.map((entry, index) => <div key={index} className="mt-3 rounded-lg bg-stone-50 p-3 text-sm">
          <p>{entry.action} by {entry.actor} at {time(entry.at)}</p>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(entry.values, null, 2)}</pre>
        </div>)}
      </details>
  </dialog>;
}
