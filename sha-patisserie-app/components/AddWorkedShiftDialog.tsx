'use client';

 

import { useEffect, useRef, useState } from 'react';

interface StaffOption {
  id: string;
  name: string | null;
  role?: string;
  status?: string;
  location?: { code: string; name: string } | null;
}

export interface CreatedWorkedShift {
  sourceKey: string;
  start: string;
  end: string;
  breakMinutes: number;
  reason: string;
}

const inputClass = 'min-w-0 max-w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base sm:text-sm disabled:bg-stone-100';
const buttonClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50';

export default function AddWorkedShiftDialog({ weekDays, today, defaultVenue, initialUserId, initialDate, onClose, onCreated }: {
  weekDays: string[];
  today: string;
  defaultVenue: 'SHA' | 'ZB';
  initialUserId?: string;
  initialDate?: string;
  onClose: () => void;
  onCreated: (created: CreatedWorkedShift) => void | Promise<void>;
}) {
  const firstDay = weekDays[0];
  const lastDay = weekDays[weekDays.length - 1];
  // Hours can only be added for days that have started, within the week on screen.
  const maxDate = today < lastDay ? today : lastDay;
  const noDatesAvailable = firstDay > maxDate;

  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [userId, setUserId] = useState(initialUserId ?? '');
  const [workDate, setWorkDate] = useState(noDatesAvailable ? '' : initialDate && initialDate >= firstDay && initialDate <= maxDate ? initialDate : maxDate);
  const [venue, setVenue] = useState<'SHA' | 'ZB'>(defaultVenue);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/users')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load staff.');
        if (!Array.isArray(data)) throw new Error('Invalid staff response.');
        if (!cancelled) setStaff((data as StaffOption[]).filter((person) => person.role !== 'ADMIN'));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load staff.');
      })
      .finally(() => {
        if (!cancelled) setLoadingStaff(false);
      });
    return () => { cancelled = true; };
  }, []);

  const sortedStaff = [...staff].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const chooseStaff = (id: string) => {
    setUserId(id);
    const code = staff.find((person) => person.id === id)?.location?.code;
    if (code === 'SHA' || code === 'ZB') setVenue(code);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!reason.trim()) {
      setError('Add a short reason for this shift.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/admin/reports/manual-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, workDate, startTime, endTime, breakMinutes, venue, reason: reason.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to add the shift.');
      // The parent closes this dialog and opens the new shift for review.
      await onCreated({
        sourceKey: data.sourceKey,
        start: data.startTime,
        end: data.endTime,
        breakMinutes: data.breakMinutes,
        reason: reason.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add the shift.');
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="worked-shift-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      className="admin-responsive-form m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-4 text-stone-900 shadow-xl backdrop:bg-black/40 sm:p-6"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="worked-shift-title" className="text-xl font-semibold">Add worked shift</h2>
            <p className="mt-1 text-sm text-stone-600">
              For someone who worked a day that is not on the roster. It adds a shift for that day, labelled
              &quot;Timesheet entry&quot;, and opens it so you can check the hours and break.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className={buttonClass}>Close</button>
        </div>

        {noDatesAvailable && (
          <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This week has not started yet. Choose a current or past week to add worked hours.
          </p>
        )}

        <fieldset disabled={busy || noDatesAvailable} className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium sm:col-span-2">
            Staff member
            <select required value={userId} onChange={(event) => chooseStaff(event.target.value)} className={inputClass}>
              <option value="">{loadingStaff ? 'Loading staff...' : 'Choose staff'}</option>
              {sortedStaff.map((person) => (
                <option key={person.id} value={person.id}>
                  {(person.name || person.id) + (person.status === 'INACTIVE' ? ' (Inactive)' : '')}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Date
            <input required type="date" min={firstDay} max={maxDate} value={workDate}
              onChange={(event) => setWorkDate(event.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Venue
            <select value={venue} onChange={(event) => setVenue(event.target.value === 'ZB' ? 'ZB' : 'SHA')} className={inputClass}>
              <option value="SHA">Sha Patisserie</option>
              <option value="ZB">Zushi Bento</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Start
            <input required type="time" step="60" value={startTime}
              onChange={(event) => setStartTime(event.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            End
            <input required type="time" step="60" value={endTime}
              onChange={(event) => setEndTime(event.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Break (min)
            <input required type="number" min="0" max="240" step="5" value={breakMinutes}
              onChange={(event) => setBreakMinutes(Number(event.target.value))} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium sm:col-span-2">
            Reason (required)
            <textarea required maxLength={2000} rows={3} value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why was this shift worked outside the roster?"
              className={inputClass} />
          </label>
        </fieldset>

        {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className={buttonClass}>Cancel</button>
          <button type="submit" disabled={busy || noDatesAvailable || !userId}
            className={`${buttonClass} bg-emerald-700 text-white`}>
            {busy ? 'Adding...' : 'Add shift and review hours'}
          </button>
        </div>
      </form>
    </dialog>
  );
}