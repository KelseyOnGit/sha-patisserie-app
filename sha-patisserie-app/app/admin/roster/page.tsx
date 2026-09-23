'use client';

import { useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  name: string | null;
  employmentType: string | null;
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

export default function ShiftRoster() {
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [weekStart, setWeekStart] = useState(() => localDate(mondayOf(new Date().toISOString().slice(0, 10))));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: 'SHA', roleTag: '', notes: '' });

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
    shifts: shifts.filter((shift) => dateKey(new Date(shift.startTime)) === day.key),
  })), [shifts, weekDays]);

  const resetForm = () => {
    setEditingId(null);
    setRepeatWeeks(1);
    setFormData({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: 'SHA', roleTag: '', notes: '' });
  };

  const editShift = (shift: Shift) => {
    setEditingId(shift.id);
    setRepeatWeeks(1);
    setFormData({
      userId: shift.userId,
      startTime: localDateTime(new Date(shift.startTime)),
      endTime: localDateTime(new Date(shift.endTime)),
      breakMinutes: shift.breakMinutes,
      location: shift.location?.code || 'SHA',
      roleTag: shift.roleTag || '',
      notes: shift.notes || '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
          <h1 className="mt-1 text-3xl font-serif text-stone-900">Weekly roster</h1>
        </div>
        <label className="text-sm font-semibold text-stone-700">Week starting Monday
          <input type="date" value={weekStart} onChange={(event) => setWeekStart(localDate(mondayOf(event.target.value)))} className="ml-3 rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal" />
        </label>
      </div>

      {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-stone-900">{editingId ? 'Edit shift' : 'Add shift'}</h2>{editingId && <button type="button" onClick={resetForm} className="text-sm text-stone-500 underline">Cancel edit</button>}</div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Staff
            <select required value={formData.userId} onChange={(event) => setFormData({ ...formData, userId: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm"><option value="">Select staff</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name || user.id}</option>)}</select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Start<input required type="datetime-local" value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">End<input required type="datetime-local" value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Location<select value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm"><option value="SHA">Sha Patisserie</option><option value="ZB">Zushi Bento</option></select></label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Break minutes<input type="number" min="0" value={formData.breakMinutes} onChange={(event) => setFormData({ ...formData, breakMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Role / station<input value={formData.roleTag} onChange={(event) => setFormData({ ...formData, roleTag: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" /></label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500 md:col-span-2">Notes<input value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" /></label>
        </div>
        {!editingId && <label className="mt-4 inline-flex items-center gap-2 text-sm text-stone-700">Repeat every week<select value={repeatWeeks} onChange={(event) => setRepeatWeeks(Number(event.target.value))} className="rounded-lg border border-stone-300 px-2 py-1"><option value="1">Once</option><option value="2">2 weeks</option><option value="3">3 weeks</option><option value="4">4 weeks</option></select></label>}
        <button type="submit" className="mt-4 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700">{editingId ? 'Save changes' : 'Publish shift'}</button>
      </form>

      <section className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="grid min-w-[1050px] grid-cols-7 divide-x divide-stone-200">
        {shiftsByDay.map((day) => <div key={day.key} className="min-h-[360px] bg-stone-50/60"><div className="border-b border-stone-200 bg-stone-100 px-3 py-3"><p className="text-sm font-bold text-stone-800">{day.name}</p><p className="text-xs text-stone-500">{day.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p></div><div className="space-y-2 p-2">{loading ? <p className="p-2 text-xs text-stone-400">Loading...</p> : day.shifts.map((shift) => <button type="button" key={shift.id} onClick={() => editShift(shift)} className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left shadow-sm hover:border-amber-400"><p className="text-sm font-bold text-stone-900">{shift.user.name || 'Unnamed staff'}</p><p className="mt-1 text-xs text-stone-700">{new Date(shift.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p><p className="mt-1 text-[11px] text-stone-500">{shift.location?.code || 'Unassigned'} {shift.roleTag ? `• ${shift.roleTag}` : ''}</p></button>)}{!loading && day.shifts.length === 0 && <p className="p-2 text-xs text-stone-400">No shifts</p>}</div></div>)}
      </div></section>
    </div>
  );
}
