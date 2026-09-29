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

const LOCATIONS = [
  { code: 'SHA', name: 'Sha Patisserie' },
  { code: 'ZB', name: 'Zushi Bento' },
];

const ROLE_OPTIONS = ['Barista', 'Chef', 'All-rounder'];
const BREAK_OPTIONS = [0, 30];

// Time grid settings (6 AM to 10 PM)
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const ROW_HEIGHT_PX = 60; // 60px per hour
const GRID_HEIGHT_PX = TOTAL_HOURS * ROW_HEIGHT_PX;

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

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

function formatHour(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
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
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: 'SHA', roleTag: ROLE_OPTIONS[0], notes: '' });

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
    setEditingId(shift.id);
    setRepeatWeeks(1);
    setFormData({
      userId: shift.userId,
      startTime: localDateTime(new Date(shift.startTime)),
      endTime: localDateTime(new Date(shift.endTime)),
      breakMinutes: shift.breakMinutes,
      location: shift.location?.code || 'SHA',
      roleTag: shift.roleTag || ROLE_OPTIONS[0],
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

  // Calculates position and height for shifts on the time grid
  const getShiftStyle = (startTimeStr: string, endTimeStr: string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const gridStartMinutes = START_HOUR * 60;
    const top = Math.max(0, ((startMinutes - gridStartMinutes) / 60) * ROW_HEIGHT_PX);
    const height = Math.max(32, ((endMinutes - startMinutes) / 60) * ROW_HEIGHT_PX);

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
          <h1 className="mt-1 text-3xl font-serif text-stone-900">Weekly roster</h1>
        </div>
        <label className="text-sm font-semibold text-stone-700">
          Week starting Monday
          <input
            type="date"
            value={weekStart}
            onChange={(event) => setWeekStart(localDate(mondayOf(event.target.value)))}
            className="ml-3 rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal shadow-sm"
          />
        </label>
      </div>

      {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">{editingId ? 'Edit shift' : 'Add shift'}</h2>
          {editingId && <button type="button" onClick={resetForm} className="text-sm text-stone-500 underline">Cancel edit</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Staff
            <select required value={formData.userId} onChange={(event) => setFormData({ ...formData, userId: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm">
              <option value="">Select staff</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.id}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Start
            <input required type="datetime-local" value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">End
            <input required type="datetime-local" value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Location
            <select value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm">
              {LOCATIONS.map((loc) => <option key={loc.code} value={loc.code}>{loc.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Break
            <select value={formData.breakMinutes} onChange={(event) => setFormData({ ...formData, breakMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm">
              {BREAK_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Role / station
            <select value={formData.roleTag} onChange={(event) => setFormData({ ...formData, roleTag: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm">
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-500 md:col-span-2">Notes
            <input value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm" />
          </label>
        </div>
        {!editingId && (
          <label className="mt-4 inline-flex items-center gap-2 text-sm text-stone-700">
            Repeat every week
            <select value={repeatWeeks} onChange={(event) => setRepeatWeeks(Number(event.target.value))} className="rounded-lg border border-stone-300 px-2 py-1">
              <option value="1">Once</option>
              <option value="2">2 weeks</option>
              <option value="3">3 weeks</option>
              <option value="4">4 weeks</option>
            </select>
          </label>
        )}
        <button type="submit" className="mt-4 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700">
          {editingId ? 'Save changes' : 'Publish shift'}
        </button>
      </form>

      {/* Roster Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-stone-300 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => goToWeek(-1)}
              aria-label="Previous week"
              className="flex items-center justify-center border-r border-stone-200 px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-l-lg transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goToWeek(1)}
              aria-label="Next week"
              className="flex items-center justify-center px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-r-lg transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-base font-semibold text-stone-800">
            {formatDMY(mondayOf(weekStart))} - {formatDMY(weekDays[6].date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Location Switcher */}
          <div className="inline-flex rounded-lg border border-stone-300 bg-stone-100 p-1">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => setLocationFilter(loc.code)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  locationFilter === loc.code
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={duplicateWeek}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 shadow-sm"
          >
            Duplicate to next week
          </button>
        </div>
      </div>

      {/* Timeline Calendar View */}
      <section className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="min-w-[1100px]">
          {/* Header row: empty cell for time column + day columns */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-stone-200 bg-stone-100">
            <div className="border-r border-stone-200 p-3"></div>
            {shiftsByDay.map((day) => (
              <div key={day.key} className="border-r border-stone-200 px-3 py-3 text-center last:border-r-0">
                <p className="text-sm font-bold text-stone-800">{day.name}</p>
                <p className="text-xs text-stone-500">{formatDMY(day.date)}</p>
              </div>
            ))}
          </div>

          {/* Body: Side time-axis + 7 day columns */}
          <div className="grid grid-cols-[70px_repeat(7,1fr)] relative" style={{ height: `${GRID_HEIGHT_PX}px` }}>
            {/* Time points column on the side */}
            <div className="border-r border-stone-200 bg-stone-50/50 text-right select-none">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="pr-2 text-[11px] font-semibold text-stone-400 relative -top-2.5"
                  style={{ height: `${ROW_HEIGHT_PX}px` }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Horizontal background hour grid lines */}
            <div className="absolute inset-0 pointer-events-none left-[70px]">
              {HOURS.map((hour, idx) => (
                <div
                  key={hour}
                  className="border-b border-stone-100 w-full"
                  style={{ height: `${ROW_HEIGHT_PX}px` }}
                />
              ))}
            </div>

            {/* Day columns containing shifts */}
            {shiftsByDay.map((day) => (
              <div key={day.key} className="relative border-r border-stone-200 last:border-r-0">
                {day.shifts.map((shift) => {
                  const color = getUserColor(shift.userId);
                  const style = getShiftStyle(shift.startTime, shift.endTime);

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => editShift(shift)}
                      style={style}
                      className={`absolute left-1 right-1 z-10 rounded-lg border ${color.border} ${color.bg} p-2 text-left shadow-xs transition hover:z-20 hover:shadow-md overflow-hidden`}
                    >
                      <p className={`text-xs font-bold leading-tight ${color.text}`}>
                        {shift.user.name || 'Unnamed staff'}
                      </p>
                      <p className="text-[11px] text-stone-600">
                        {new Date(shift.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </p>
                      {shift.roleTag && (
                        <p className="mt-0.5 inline-block text-[10px] font-medium text-stone-500">
                          {shift.roleTag}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

