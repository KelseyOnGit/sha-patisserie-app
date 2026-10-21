'use client';

import { useEffect, useRef, useState } from 'react';
import { ANNUAL_NOTICE_DAYS, leavePeriod, LEAVE_LABELS, LEAVE_STATUS_LABELS } from '@/lib/leave';

interface StaffBalance {
  id: string;
  name: string | null;
  employmentType: string | null;
  annualLeaveHours: string;
  personalLeaveHours: string;
}
interface LeaveEntry {
  id: string;
  requestGroupId?: string | null;
  replacesId?: string | null;
  userId: string;
  workDate: string;
  type: string;
  hours: string;
  status: string;
  note: string;
  reviewNote: string;
  reviewedAt: string | null;
  reviewer: { name: string | null } | null;
  user: { name: string | null };
}
const input = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm';
const button = 'rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold disabled:opacity-50';

type LeaveGroup = LeaveEntry & { ids: string[]; startDate: string; endDate: string; days: number; totalHours: number };
type DialogState =
  | { mode: 'request' }
  | { mode: 'create' }
  | { mode: 'change'; entry: LeaveGroup }
  | { mode: 'edit'; entry: LeaveGroup };

function groupedRequests(entries: LeaveEntry[]): LeaveGroup[] {
  const groups = new Map<string, LeaveGroup>();
  for (const entry of entries) {
    const key = entry.requestGroupId || entry.id;
    const date = entry.workDate.slice(0, 10);
    const current = groups.get(key);
    if (current) {
      current.ids.push(entry.id);
      current.startDate = current.startDate < date ? current.startDate : date;
      current.endDate = current.endDate > date ? current.endDate : date;
      current.days += 1;
      current.totalHours += Number(entry.hours);
    } else groups.set(key, { ...entry, ids: [entry.id], startDate: date, endDate: date, days: 1, totalHours: Number(entry.hours) });
  }
  return [...groups.values()].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Hides cancelled leave that was replaced by an edit, so it does not look like a real cancellation. */
function withoutReplaced(groups: LeaveGroup[]): LeaveGroup[] {
  const replaced = new Set(groups.filter((group) => group.replacesId && group.status !== 'REJECTED' && group.status !== 'CANCELLED').map((group) => group.replacesId as string));
  return groups.filter((group) => !(group.status === 'CANCELLED' && group.ids.some((id) => replaced.has(id))));
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-AU', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00Z`));
}

function plusDays(isoDate: string, days: number) {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

function callLeaveApi(method: 'POST' | 'PATCH', payload: object) {
  return fetch('/api/leave', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800'
    : status === 'REJECTED' ? 'bg-rose-50 text-rose-800'
    : status === 'CANCELLED' ? 'bg-stone-100 text-stone-600'
    : 'bg-amber-50 text-amber-900';
  return <span className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${tone}`}>{LEAVE_STATUS_LABELS[status] || status}</span>;
}

export default function LeavePanel({ view = 'employee' }: { view?: 'employee' | 'review' }) {
  const [staff, setStaff] = useState<StaffBalance[]>([]);
  const [requests, setRequests] = useState<LeaveEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const manage = view === 'review';

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/leave${manage ? '?view=review' : ''}`, { signal: controller.signal, cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load leave.');
        setStaff(data.staff);
        setRequests(data.requests);
        setCurrentUserId(data.currentUserId);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load leave.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [revision, manage]);

  const selected = staff.find((person) => person.id === currentUserId);
  const allGroups = groupedRequests(requests);
  const groups = withoutReplaced(allGroups);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Perth', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  function openDialog(next: DialogState) { setError(''); setMessage(''); setDialog(next); }

  const summary = (entry: LeaveGroup) => `${entry.totalHours.toFixed(2)} hours of ${LEAVE_LABELS[entry.type]} for ${entry.user.name || 'staff'} (${displayDate(entry.startDate)} - ${displayDate(entry.endDate)})`;

  async function patchLeave(payload: Record<string, unknown>, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await callLeaveApi('PATCH', payload);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update leave.');
      setMessage(data.message); setRevision((value) => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to update leave.'); }
    finally { setBusy(false); }
  }

  function review(entry: LeaveGroup, status: 'APPROVED' | 'REJECTED') {
    const what = entry.status === 'CANCEL_REQUESTED' ? 'cancellation of' : entry.replacesId ? 'change to' : '';
    const verb = status === 'APPROVED' ? 'Approve' : entry.status === 'CANCEL_REQUESTED' ? 'Decline' : 'Do not approve';
    return patchLeave({ action: 'review', id: entry.id, status, reviewNote: reviewNotes[entry.id] || '' }, `${verb} ${what} ${summary(entry)}?`.replace('  ', ' '));
  }

  const changeNote = (entry: LeaveGroup) => {
    if (!entry.replacesId || entry.status !== 'PENDING') return null;
    const original = allGroups.find((group) => group.ids.includes(entry.replacesId as string));
    return <p className="mt-1 text-xs font-medium text-amber-900">Change to leave on {original ? `${displayDate(original.startDate)} - ${displayDate(original.endDate)}` : 'earlier request'}</p>;
  };

  const staffActions = (entry: LeaveGroup) => {
    if (entry.status === 'PENDING') {
      return <div className="mt-3"><button type="button" disabled={busy} className={button} onClick={() => patchLeave({ action: 'withdraw', id: entry.id }, 'Withdraw this request?')}>Withdraw</button></div>;
    }
    if (entry.status === 'APPROVED' && entry.endDate >= today) {
      return <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={button} onClick={() => openDialog({ mode: 'change', entry })}>Change dates</button>
        <button type="button" disabled={busy} className={`${button} text-rose-700`} onClick={() => patchLeave({ action: 'request-cancel', id: entry.id }, 'Ask your manager to cancel this leave? It stays approved until they agree.')}>Request cancellation</button>
      </div>;
    }
    if (entry.status === 'CANCEL_REQUESTED') {
      return <p className="mt-3 text-xs text-stone-500">Waiting for your manager. This leave stays approved until they agree to cancel it.</p>;
    }
    return null;
  };

  const section = (title: string, entries: LeaveGroup[]) => (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {!entries.length && <p className="text-sm text-stone-500">No {title.toLowerCase()}.</p>}
      {entries.map((entry) => <article key={entry.id} className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3"><h3 className="min-w-0 text-sm font-semibold">{LEAVE_LABELS[entry.type]}</h3><StatusBadge status={entry.status} /></div>
        <p className="mt-2 text-sm text-stone-600">{displayDate(entry.startDate)} - {displayDate(entry.endDate)}</p>
        <p className="mt-1 text-xs text-stone-500">{entry.days} {entry.days === 1 ? 'day' : 'days'} · {entry.totalHours.toFixed(2)} hours</p>
        {changeNote(entry)}
        {entry.note && <p className="mt-3 break-words text-sm text-stone-600">{entry.note}</p>}
        {entry.reviewNote && <p className="mt-2 break-words text-sm text-stone-600">Manager: {entry.reviewNote}</p>}
        {staffActions(entry)}
      </article>)}
    </section>
  );

  const adminActions = (entry: LeaveGroup) => {
    const needsReview = entry.status === 'PENDING' || entry.status === 'CANCEL_REQUESTED';
    if (entry.userId === currentUserId) {
      return <span className="text-xs text-stone-500">{needsReview ? 'Another manager must review' : entry.reviewedAt?.slice(0, 10)}</span>;
    }
    const cancelling = entry.status === 'CANCEL_REQUESTED';
    const canEdit = entry.status === 'PENDING' || entry.status === 'APPROVED';
    if (!needsReview && !canEdit) return <span className="text-xs text-stone-500">{entry.reviewedAt?.slice(0, 10)}</span>;
    return <div className="space-y-2">
      {needsReview && <>
        <input aria-label={`Review note for ${entry.user.name || 'staff'}`} placeholder="Review note" maxLength={2000} value={reviewNotes[entry.id] || ''} onChange={(event) => setReviewNotes((current) => ({ ...current, [entry.id]: event.target.value }))} className={input} />
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className={`${button} text-emerald-800`} onClick={() => review(entry, 'APPROVED')}>{cancelling ? 'Approve cancellation' : 'Approve'}</button>
          <button disabled={busy} className={`${button} text-rose-700`} onClick={() => review(entry, 'REJECTED')}>{cancelling ? 'Keep leave' : 'Not approve'}</button>
        </div>
      </>}
      {canEdit && <div className="flex flex-wrap gap-2">
        <button disabled={busy} className={button} onClick={() => openDialog({ mode: 'edit', entry })}>Edit</button>
        {entry.status === 'APPROVED' && <button disabled={busy} className={`${button} text-rose-700`} onClick={() => patchLeave({ action: 'cancel', id: entry.id, reviewNote: reviewNotes[entry.id] || '' }, `Cancel ${summary(entry)} and return the hours?`)}>Cancel leave</button>}
      </div>}
    </div>;
  };

  const visible = groups.filter((entry) => !statusFilter || entry.status === statusFilter);

  return <div className={`min-w-0 w-full space-y-6 text-left text-stone-900 ${manage ? '' : 'mx-auto max-w-md'}`}>
    <header className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
      <h1 className="text-2xl font-semibold">{manage ? 'Leave Requests' : 'My Leave'}</h1>
      <button type="button" onClick={() => openDialog(manage ? { mode: 'create' } : { mode: 'request' })} disabled={loading || (!manage && !selected)} className={`${button} shrink-0 bg-emerald-700 text-white hover:bg-emerald-800`}>{manage ? 'Create leave' : 'Request leave'}</button>
    </header>
    {message && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
    {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {loading ? <p className="py-5 text-sm text-stone-500">Loading leave...</p> : manage ? <>
      <label className="block max-w-xs text-sm font-medium">Status<select className={`${input} mt-1`} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        <option value="">All statuses</option>{Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50"><tr>{['Staff / period', 'Leave / hours', 'Status / notes', 'Actions'].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead>
          <tbody>{visible.map((entry) => <tr key={entry.id} className="border-b border-stone-200 align-top">
            <td className="p-3 font-medium">{entry.user.name || 'Unnamed staff'}<div className="mt-1 text-xs font-normal text-stone-500">{displayDate(entry.startDate)} - {displayDate(entry.endDate)}</div></td>
            <td className="p-3">{LEAVE_LABELS[entry.type]}<div className="mt-1 text-xs text-stone-500">{entry.days} {entry.days === 1 ? 'day' : 'days'} · {entry.totalHours.toFixed(2)} hours</div></td>
            <td className="max-w-xs break-words p-3"><StatusBadge status={entry.status} />{changeNote(entry)}<p className="mt-2">{entry.note}</p><p>{entry.reviewNote}</p>{entry.reviewer && <p className="mt-1 text-xs text-stone-500">Reviewed by {entry.reviewer.name || 'Manager'}</p>}</td>
            <td className="p-3">{adminActions(entry)}</td>
          </tr>)}</tbody>
        </table>
        {!visible.length && <p className="py-6 text-sm text-stone-500">No leave requests for this status.</p>}
      </div>
    </> : <>
      {selected && <div className="grid grid-cols-2 gap-4 border-b border-stone-200 pb-5">
        {selected.employmentType === 'FULL_TIME' || selected.employmentType === 'PART_TIME' ? <>
          <div><p className="text-xs text-stone-500">Annual leave balance</p><p className="mt-1 text-lg font-semibold">{selected.annualLeaveHours} h</p></div>
          <div><p className="text-xs text-stone-500">Personal leave balance</p><p className="mt-1 text-lg font-semibold">{selected.personalLeaveHours} h</p></div>
        </> : <p className="col-span-2 text-sm text-stone-500">Paid leave entitlement: None</p>}
      </div>}
      {section('My requests', groups.filter((entry) => entry.status === 'PENDING'))}
      {section('Scheduled', groups.filter((entry) => (entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate >= today))}
      {section('History', groups.filter((entry) => entry.status === 'REJECTED' || entry.status === 'CANCELLED' || ((entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate < today)))}
    </>}
    {dialog && <LeaveDialog
      key={`${dialog.mode}-${'entry' in dialog ? dialog.entry.id : ''}`}
      state={dialog} staff={staff} currentUserId={currentUserId} today={today}
      onClose={() => setDialog(null)}
      onSubmitted={(text) => { setMessage(text); setDialog(null); setRevision((value) => value + 1); }}
    />}
  </div>;
}

const DIALOG_TEXT: Record<DialogState['mode'], { title: string; send: string; help: string }> = {
  request: { title: 'Request leave', send: 'Send', help: '' },
  create: { title: 'Create leave for staff', send: 'Create leave', help: 'Approved straight away, and paid leave comes off their balance.' },
  change: { title: 'Change leave dates', send: 'Send change for approval', help: 'Your current leave stays approved until a manager approves this change.' },
  edit: { title: 'Edit leave', send: 'Save changes', help: 'Applies straight away. The balance is adjusted by the difference.' },
};

function LeaveDialog({ state, staff, currentUserId, today, onClose, onSubmitted }: {
  state: DialogState; staff: StaffBalance[]; currentUserId: string; today: string; onClose: () => void; onSubmitted: (message: string) => void;
}) {
  const entry = state.mode === 'change' || state.mode === 'edit' ? state.entry : null;
  const [userId, setUserId] = useState('');
  const person = state.mode === 'create' ? staff.find((item) => item.id === userId) : staff.find((item) => item.id === (entry ? entry.userId : currentUserId));
  const entitled = person?.employmentType === 'FULL_TIME' || person?.employmentType === 'PART_TIME';
  const [chosenType, setChosenType] = useState(entry?.type ?? 'ANNUAL');
  const type = entitled ? chosenType : 'UNPAID';
  const [startDate, setStartDate] = useState(entry?.startDate ?? '');
  const [endDate, setEndDate] = useState(entry?.endDate ?? '');
  const [hours, setHours] = useState(entry ? String(Number(entry.hours)) : '7.5');
  const [note, setNote] = useState(entry?.note ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const text = DIALOG_TEXT[state.mode];
  const staffMode = state.mode === 'request' || state.mode === 'change';
  const minStart = staffMode && type === 'ANNUAL' ? plusDays(today, ANNUAL_NOTICE_DAYS) : undefined;
  let days = 0;
  try { days = leavePeriod(startDate, endDate).length; } catch { /* Incomplete date selection. */ }
  const totalHours = days * Number(hours);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    try {
      leavePeriod(startDate, endDate);
      if (state.mode === 'create' && !userId) throw new Error('Choose a staff member.');
      setBusy(true);
      const payload = { startDate, endDate, type, hours, note };
      const response = state.mode === 'edit' ? await callLeaveApi('PATCH', { ...payload, action: 'edit', id: entry?.id })
        : state.mode === 'create' ? await callLeaveApi('POST', { ...payload, userId })
        : state.mode === 'change' ? await callLeaveApi('POST', { ...payload, replacesId: entry?.id })
        : await callLeaveApi('POST', payload);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save leave.');
      onSubmitted(data.message);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save leave.'); }
    finally { setBusy(false); }
  }

  return <dialog ref={dialog} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="leave-dialog-title" className="m-auto flex h-[min(42rem,calc(100dvh_-_2rem))] w-[calc(100%_-_2rem)] max-w-md flex-col rounded-lg bg-white p-5 text-stone-900 shadow-xl backdrop:bg-black/40">
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <header className="mb-5 flex items-center justify-between gap-3 border-b border-stone-200 pb-3"><h2 id="leave-dialog-title" className="text-lg font-semibold">{text.title}</h2><button type="button" onClick={onClose} disabled={busy} className="px-2 py-1 text-sm text-stone-600">Close</button></header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {text.help && <p className="text-sm text-stone-600">{text.help}</p>}
        {state.mode === 'create' && <label className="block text-sm font-medium">Staff member<select required value={userId} onChange={(event) => setUserId(event.target.value)} disabled={busy} className={`${input} mt-1`}>
          <option value="">Choose staff</option>
          {staff.filter((item) => item.id !== currentUserId).map((item) => <option key={item.id} value={item.id}>{item.name || 'Unnamed staff'}</option>)}
        </select></label>}
        {entry && state.mode === 'edit' && <p className="text-sm font-medium">{entry.user.name || 'Unnamed staff'}</p>}
        {!staffMode && person && (entitled
          ? <p className="text-xs text-stone-500">Balances: annual {person.annualLeaveHours} h, personal {person.personalLeaveHours} h</p>
          : <p className="text-xs text-stone-500">No paid leave entitlement, so unpaid leave only.</p>)}
        <label className="block text-sm font-medium">Leave type<select value={type} onChange={(event) => setChosenType(event.target.value)} disabled={busy} className={`${input} mt-1`}>
          {entitled && <><option value="ANNUAL">Annual leave</option><option value="PERSONAL">Personal leave</option></>}<option value="UNPAID">Unpaid leave</option>
        </select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="min-w-0 text-sm font-medium">Start date<input required type="date" min={minStart} value={startDate} onChange={(event) => { const value = event.target.value; setStartDate(value); if (!endDate || endDate < value) setEndDate(value); }} disabled={busy} className={`${input} mt-1 min-w-0`} /></label>
          <label className="min-w-0 text-sm font-medium">End date<input required type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} disabled={busy} className={`${input} mt-1 min-w-0`} /></label>
        </div>
        {minStart && <p className="text-xs text-stone-500">Annual leave needs at least {ANNUAL_NOTICE_DAYS} days of notice, so the earliest start is {displayDate(minStart)}.</p>}
        <label className="block text-sm font-medium">Hours per day<input required type="number" min="0.01" max="24" step="0.01" value={hours} onChange={(event) => setHours(event.target.value)} disabled={busy} className={`${input} mt-1`} /></label>
        {days > 0 && <p className="text-sm text-stone-600">{days} calendar {days === 1 ? 'day' : 'days'} (including weekends) · {Number.isFinite(totalHours) ? totalHours.toFixed(2) : '0.00'} hours total</p>}
        <label className="block text-sm font-medium">Note<textarea maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} disabled={busy} rows={3} className={`${input} mt-1 resize-y`} /></label>
        {error && <p role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      </div>
      <button disabled={busy} className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{busy ? 'Saving...' : text.send}</button>
    </form>
  </dialog>;
}
