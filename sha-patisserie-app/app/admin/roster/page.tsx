'use client';

import { useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  name: string | null;
  employmentType: string | null;
  location: { code: string; name: string } | null;
}

interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  roleTag: string | null;
  notes: string | null;
  user: User;
  location: { code: string; name: string } | null;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LOCATIONS = [
  { code: 'SHA', name: 'Sha Patisserie' },
  { code: 'ZB', name: 'Zushi Bento' },
];

const ROLE_OPTIONS = ['Barista', 'Chef', 'All-rounder'];
const BREAK_OPTIONS = [0, 30];

const USER_COLOR_PALETTE = [
  { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900' },
  { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-900' },
  { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-900' },
  { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
  { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', text: 'text-fuchsia-900' },
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getUserColor(userId: string) {
  return USER_COLOR_PALETTE[hashString(userId) % USER_COLOR_PALETTE.length];
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function mondayOf(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localDateTime(date: Date) {
  return `${localDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDMY(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatShiftTime(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ShiftRoster() {
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [weekStart, setWeekStart] = useState(() => localDate(mondayOf(new Date().toISOString().slice(0, 10))));
  const [locationFilter, setLocationFilter] = useState('SHA');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: 'SHA', roleTag: ROLE_OPTIONS[0], notes: '' });
  const locationUsers = useMemo(
    () => users.filter((user) => user.location?.code === locationFilter),
    [users, locationFilter]
  );
  const availableUsers = useMemo(() => {
    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return locationUsers;

    return locationUsers.filter((user) => !shifts.some((shift) => {
      if (shift.userId !== user.id || shift.id === editingId) return false;
      return new Date(shift.startTime).getTime() < end && new Date(shift.endTime).getTime() > start;
    }));
  }, [locationUsers, shifts, formData.startTime, formData.endTime, editingId]);

  const loadData = async () => {
    try {
      const [usersResponse, shiftsResponse] = await Promise.all([fetch('/api/users'), fetch('/api/shifts')]);
      const usersData = await usersResponse.json();
      const shiftsData = await shiftsResponse.json();
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(shiftsData)) setShifts(shiftsData);
    } catch (error) {
      console.error('Failed to load roster:', error);
      setMessage('Failed to load roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const weekDays = useMemo(() => {
    const first = mondayOf(weekStart);
    return days.map((name, index) => {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      return { name, date, key: dateKey(date) };
    });
  }, [weekStart]);

  const shiftsByDay = useMemo(() => weekDays.map((day) => ({
    ...day,
    shifts: shifts.filter((shift) =>
      dateKey(new Date(shift.startTime)) === day.key &&
      shift.location?.code === locationFilter
    ),
  })), [shifts, weekDays, locationFilter]);

  const goToWeek = (offsetWeeks: number) => {
    const next = mondayOf(weekStart);
    next.setDate(next.getDate() + offsetWeeks * 7);
    setWeekStart(localDate(next));
  };

  const resetForm = () => {
    setEditingId(null);
    setRepeatWeeks(1);
    setFormData({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: locationFilter, roleTag: ROLE_OPTIONS[0], notes: '' });
    setIsFormOpen(false);
  };

  const switchLocation = (code: string) => {
    setLocationFilter(code);
    setEditingId(null);
    setRepeatWeeks(1);
    setFormData({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: code, roleTag: ROLE_OPTIONS[0], notes: '' });
    setIsFormOpen(false);
  };

  const openShiftForm = (userId: string, date: Date) => {
    setEditingId(null);
    setRepeatWeeks(1);
    setFormData({
      userId,
      startTime: `${dateKey(date)}T09:00`,
      endTime: `${dateKey(date)}T17:00`,
      breakMinutes: 30,
      location: locationFilter,
      roleTag: ROLE_OPTIONS[0],
      notes: '',
    });
    setMessage('');
    setIsFormOpen(true);
  };

  const duplicateWeek = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/roster/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: mondayOf(weekStart).toISOString() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to duplicate roster');
      setMessage(data.count ? `Duplicated ${data.count} shift(s) to next week.` : 'No shifts found for this week.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to duplicate roster.');
    }
  };

  const editShift = (shift: Shift) => {
    const location = shift.location?.code || 'SHA';
    setLocationFilter(location);
    setEditingId(shift.id);
    setRepeatWeeks(1);
    setFormData({
      userId: shift.userId,
      startTime: localDateTime(new Date(shift.startTime)),
      endTime: localDateTime(new Date(shift.endTime)),
      breakMinutes: shift.breakMinutes,
      location,
      roleTag: shift.roleTag || ROLE_OPTIONS[0],
      notes: shift.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!availableUsers.some((user) => user.id === formData.userId)) {
      setMessage('That staff member is already assigned to an overlapping shift.');
      return;
    }
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch('/api/shifts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save shift');
      }

      if (!editingId && repeatWeeks > 1) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        for (let week = 1; week < repeatWeeks; week += 1) {
          const repeatedStart = new Date(start);
          const repeatedEnd = new Date(end);
          repeatedStart.setDate(repeatedStart.getDate() + week * 7);
          repeatedEnd.setDate(repeatedEnd.getDate() + week * 7);
          await fetch('/api/shifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, startTime: repeatedStart.toISOString(), endTime: repeatedEnd.toISOString() }),
          });
        }
      }

      setMessage(editingId ? 'Shift updated.' : repeatWeeks > 1 ? `Shift added for ${repeatWeeks} weeks.` : 'Shift published.');
      resetForm();
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save shift.');
    }
  };

  const handleDeleteShift = async () => {
    if (!editingId) return;

    const shift = shifts.find((item) => item.id === editingId);
    const shiftDate = shift ? formatDMY(new Date(shift.startTime)) : 'this date';
    const staffName = shift?.user.name || 'this staff member';
    if (!window.confirm(`Delete ${staffName}'s shift on ${shiftDate}? This cannot be undone.`)) return;

    setDeleting(true);
    setMessage('');
    try {
      const response = await fetch(`/api/shifts?id=${encodeURIComponent(editingId)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete shift');

      resetForm();
      setMessage('Shift deleted.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete shift.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
          <h1 className="mt-1 text-3xl font-serif text-stone-900">Weekly roster</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-semibold text-stone-700">
            Week starting Monday
            <input
              type="date"
              value={weekStart}
              onChange={(event) => setWeekStart(localDate(mondayOf(event.target.value)))}
              className="ml-3 rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal shadow-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => openShiftForm('', weekDays[0].date)}
            disabled={locationUsers.length === 0}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            Add shift
          </button>
        </div>
      </div>

      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-stone-300 bg-white shadow-sm">
            <button type="button" onClick={() => goToWeek(-1)} aria-label="Previous week" className="border-r border-stone-200 px-3 py-2 text-stone-600 hover:bg-stone-50">&lt;</button>
            <button type="button" onClick={() => goToWeek(1)} aria-label="Next week" className="px-3 py-2 text-stone-600 hover:bg-stone-50">&gt;</button>
          </div>
          <p className="text-sm font-semibold text-stone-800">
            {formatDMY(mondayOf(weekStart))} - {formatDMY(weekDays[6].date)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {LOCATIONS.map((location) => (
            <button
              key={location.code}
              type="button"
              aria-pressed={locationFilter === location.code}
              onClick={() => switchLocation(location.code)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${locationFilter === location.code ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'}`}
            >
              {location.name}
            </button>
          ))}
          <button type="button" onClick={duplicateWeek} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Duplicate to next week
          </button>
        </div>
      </div>

      <section className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[1100px] table-fixed border-collapse text-left">
          <thead className="bg-stone-50">
            <tr>
              <th className="sticky left-0 z-20 w-48 border-b border-r border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold uppercase text-stone-500">Staff</th>
              {weekDays.map((day) => (
                <th key={day.key} className="border-b border-r border-stone-200 px-3 py-3 text-center last:border-r-0">
                  <span className="block text-sm font-bold text-stone-800">{day.name.slice(0, 3)}</span>
                  <span className="mt-1 block text-xs font-normal text-stone-500">{formatDMY(day.date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-stone-500">Loading roster...</td></tr>
            ) : locationUsers.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-stone-500">No staff are assigned to this venue.</td></tr>
            ) : locationUsers.map((user) => (
              <tr key={user.id}>
                <th scope="row" className="sticky left-0 z-10 w-48 border-r border-stone-200 bg-white px-4 py-3 align-top">
                  <span className="block text-sm font-semibold text-stone-900">{user.name || 'Unnamed staff'}</span>
                  <span className="mt-1 block text-xs font-normal text-stone-500">{user.employmentType?.replaceAll('_', ' ') || 'Staff'}</span>
                </th>
                {shiftsByDay.map((day) => {
                  const userShifts = day.shifts.filter((shift) => shift.userId === user.id);
                  return (
                    <td key={`${user.id}-${day.key}`} className="h-28 border-r border-stone-200 p-2 align-top last:border-r-0">
                      <div className="flex min-h-24 flex-col gap-2">
                        {userShifts.map((shift) => {
                          const color = getUserColor(shift.userId);
                          return (
                            <button
                              key={shift.id}
                              type="button"
                              onClick={() => editShift(shift)}
                              className={`w-full rounded-md border p-2 text-left transition hover:shadow-sm ${color.border} ${color.bg}`}
                            >
                              <span className={`block text-xs font-bold ${color.text}`}>
                                {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                              </span>
                              {shift.roleTag && <span className="mt-1 block text-xs text-stone-700">{shift.roleTag}</span>}
                              {shift.breakMinutes > 0 && <span className="mt-1 block text-[11px] text-stone-600">{shift.breakMinutes} min break</span>}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => openShiftForm(user.id, day.date)}
                          aria-label={`Add ${user.name || 'staff'} shift on ${day.name}`}
                          className="flex min-h-8 w-full flex-1 items-center justify-center rounded-md border border-dashed border-stone-300 text-xl font-medium text-stone-400 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) resetForm();
        }}>
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="shift-form-title" className="w-full max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 id="shift-form-title" className="text-lg font-semibold text-stone-900">{editingId ? 'Edit shift' : 'Add shift'}</h2>
              <button type="button" onClick={resetForm} disabled={deleting} className="rounded-md px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50">Close</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Staff
                <select required value={formData.userId} onChange={(event) => setFormData({ ...formData, userId: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900">
                  <option value="">Select staff</option>
                  {availableUsers.map((user) => <option key={user.id} value={user.id}>{user.name || user.id}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Start
                <input required type="datetime-local" value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">End
                <input required type="datetime-local" value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Break
                <select value={formData.breakMinutes} onChange={(event) => setFormData({ ...formData, breakMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900">
                  {BREAK_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Role / station
                <select value={formData.roleTag} onChange={(event) => setFormData({ ...formData, roleTag: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900">
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Notes
                <input value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-sm normal-case text-stone-900" />
              </label>
            </div>
            {!editingId && (
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                Repeat every week
                <select value={repeatWeeks} onChange={(event) => setRepeatWeeks(Number(event.target.value))} className="rounded-lg border border-stone-300 px-2 py-1">
                  <option value="1">Once</option>
                  <option value="2">2 weeks</option>
                  <option value="3">3 weeks</option>
                  <option value="4">4 weeks</option>
                </select>
              </label>
            )}
            {formData.userId && !availableUsers.some((user) => user.id === formData.userId) && (
              <p role="alert" className="text-sm text-rose-700">This staff member already has an overlapping shift.</p>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
              {editingId ? (
                <button type="button" onClick={handleDeleteShift} disabled={deleting} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete shift'}
                </button>
              ) : <span />}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} disabled={deleting} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={deleting || loading || availableUsers.length === 0 || !availableUsers.some((user) => user.id === formData.userId)} className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {editingId ? 'Save changes' : 'Publish shift'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

