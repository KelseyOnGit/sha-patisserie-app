'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_WORKING_HOURS, WORKING_DAYS, regularHoursFor, type WorkingHoursMap } from '@/lib/workingHours';
import { WA_PUBLIC_HOLIDAYS } from '@/lib/holidays';
import { fetchRosterLeave, type RosterLeave } from '@/lib/roster-leave';
import RosterLeaveCard from '@/components/RosterLeaveCard';
import { parseRosterTime, perthDateTime } from '@/lib/roster-time';
import { currentWeek, perthDate } from '@/lib/timesheets';
import { rosterStaff, assignableStaff } from '@/lib/roster-staff';

interface User {
  id: string;
  name: string | null;
  employmentType: string | null;
  location: { code: string; name: string } | null;
  status?: string;
  regularWorkingHours?: Partial<WorkingHoursMap> | null;
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
  publishedAt: string | null;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LOCATIONS = [
  { code: 'SHA', name: 'Sha Patisserie' },
  { code: 'ZB', name: 'Zushi Bento' },
];

const ROLE_OPTIONS = ['Barista', 'Chef', 'All-rounder'];
const BREAK_OPTIONS = [0, 30];

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

function formatClock(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'pm' : 'am'}`;
}

export default function ShiftRoster() {
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leave, setLeave] = useState<RosterLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [weekStart, setWeekStart] = useState(currentWeek);
  const [locationFilter, setLocationFilter] = useState('SHA');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [filling, setFilling] = useState(false);
  const [formError, setFormError] = useState('');
  const lastLoad = useRef(0);
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({ userId: '', startTime: '', endTime: '', breakMinutes: 30, location: 'SHA', roleTag: ROLE_OPTIONS[0], notes: '' });
  const locationUsers = useMemo(
    () => users.filter((user) => user.location?.code === locationFilter),
    [users, locationFilter]
  );
  const inactiveIds = useMemo(
    () => new Set(users.filter((user) => user.status === 'INACTIVE').map((user) => user.id)),
    [users]
  );
  // Inactive staff can't be given new shifts. The one exception is correcting an
  // existing shift of theirs, so that person stays selectable while editing it.
  const editingUserId = editingId ? shifts.find((shift) => shift.id === editingId)?.userId : undefined;
  const assignableUsers = useMemo(
    () => assignableStaff(users, locationFilter, editingUserId),
    [users, locationFilter, editingUserId]
  );
  const availableUsers = useMemo(() => {
    const start = parseRosterTime(formData.startTime).getTime();
    const end = parseRosterTime(formData.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return assignableUsers;

    const startDay = perthDate(new Date(start));

    return assignableUsers.filter((user) => !shifts.some((shift) => {
      if (shift.userId !== user.id || shift.id === editingId) return false;
      const overlaps = new Date(shift.startTime).getTime() < end && new Date(shift.endTime).getTime() > start;
      return overlaps || perthDate(shift.startTime) === startDay;
    }));
  }, [assignableUsers, shifts, formData.startTime, formData.endTime, editingId]);

  const report = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const loadData = useCallback(() => {
    // Only fetch the week on screen (plus a day either side for overnight shifts).
    const monday = new Date(`${localDate(mondayOf(weekStart))}T00:00:00+08:00`).getTime();
    const range = `from=${new Date(monday - 86400000).toISOString()}&to=${new Date(monday + 8 * 86400000).toISOString()}`;
    return Promise.all([
      fetch('/api/users'), fetch(`/api/shifts?${range}`), fetchRosterLeave(),
    ]).then(async ([usersResponse, shiftsResponse, leaveData]) => {
      const usersData = await usersResponse.json();
      const shiftsData = await shiftsResponse.json();
      if (!usersResponse.ok) throw new Error(usersData.error || 'Failed to load roster staff.');
      if (!shiftsResponse.ok) throw new Error(shiftsData.error || 'Failed to load roster shifts.');
      if (!Array.isArray(usersData) || !Array.isArray(shiftsData)) throw new Error('Invalid roster response.');
      setUsers(usersData);
      setShifts(shiftsData);
      setLeave(leaveData);
    }).catch((error: unknown) => {
      console.error('Failed to load roster:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to load roster.');
      setIsError(true);
    }).finally(() => {
      setLoading(false);
    });
  }, [weekStart]);

  useEffect(() => {
    loadData();
    lastLoad.current = Date.now();
    // Refresh when returning to the tab, but not within a minute of the last load.
    const refresh = () => {
      if (Date.now() - lastLoad.current < 60_000) return;
      lastLoad.current = Date.now();
      void loadData();
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [loadData]);

  const weekDays = useMemo(() => {
    const first = mondayOf(weekStart);
    return days.map((name, index) => {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      return { name, date, key: dateKey(date) };
    });
  }, [weekStart]);

  // Active staff always get a row. Inactive staff only appear in weeks where they
  // actually have shifts, so past rosters stay accurate and future weeks stay clean.
  const rosterUsers = useMemo(
    () => rosterStaff(users, shifts, weekStart, locationFilter),
    [users, locationFilter, shifts, weekStart]
  );

  const shiftsByDay = useMemo(() => weekDays.map((day) => ({
    ...day,
    shifts: shifts.filter((shift) =>
      perthDate(shift.startTime) === day.key &&
      shift.location?.code === locationFilter
    ),
  })), [shifts, weekDays, locationFilter]);

  const draftCount = useMemo(
    () => shiftsByDay.reduce(
      (total, day) => total + day.shifts.filter((shift) => !shift.publishedAt &&
        (weekStart < currentWeek() || !inactiveIds.has(shift.userId))).length,
      0
    ),
    [shiftsByDay, inactiveIds, weekStart]
  );

  const goToWeek = (offsetWeeks: number) => {
    const next = mondayOf(weekStart);
    next.setDate(next.getDate() + offsetWeeks * 7);
    setWeekStart(localDate(next));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormError('');
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
    const weekday = WORKING_DAYS[(date.getDay() + 6) % 7];
    const regular = regularHoursFor(users.find((user) => user.id === userId)?.regularWorkingHours, weekday);
    const fallback = DEFAULT_WORKING_HOURS.Monday;
    // A day that is off has no times, so use the app default.
    const schedule = regular ?? fallback;
    const savedBreak = regular?.breakMinutes;

    setEditingId(null);
    setRepeatWeeks(1);
    setFormData({
      userId,
      startTime: `${dateKey(date)}T${schedule.startTime}`,
      endTime: `${dateKey(date)}T${schedule.endTime}`,
      breakMinutes: BREAK_OPTIONS.includes(savedBreak ?? -1) ? savedBreak! : fallback.breakMinutes,
      location: locationFilter,
      roleTag: ROLE_OPTIONS[0],
      notes: '',
    });
    setMessage('');
    setFormError('');
    setIsFormOpen(true);
  };

  const duplicateWeek = async () => {
    const shiftCount = shiftsByDay.reduce(
      (total, day) => total + day.shifts.filter((shift) => !inactiveIds.has(shift.userId)).length,
      0
    );
    if (shiftCount === 0) {
      report('No shifts found for the selected week and venue.');
      return;
    }
    if (!window.confirm(`Are you sure you want to duplicate ${shiftCount} shift${shiftCount === 1 ? '' : 's'} to next week?`)) return;

    setMessage('');
    try {
      const response = await fetch('/api/roster/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: localDate(mondayOf(weekStart)), location: locationFilter }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to duplicate roster');
      report(`Duplicated ${data.count} shift(s) to next week.`);
      await loadData();
    } catch (error) {
      report(error instanceof Error ? error.message : 'Failed to duplicate roster.', true);
    }
  };

  const addSingleRegularShift = async (userId: string, date: Date) => {
    const weekday = WORKING_DAYS[(date.getDay() + 6) % 7];
    const user = users.find((u) => u.id === userId);
    const regular = regularHoursFor(user?.regularWorkingHours, weekday);

    if (!regular) return;

    const dayDateStr = dateKey(date);
    const startTime = `${dayDateStr}T${regular.startTime}`;
    const endTime = `${dayDateStr}T${regular.endTime}`;
    const savedBreak = regular.breakMinutes;
    const breakMinutes = BREAK_OPTIONS.includes(savedBreak ?? -1) ? savedBreak! : DEFAULT_WORKING_HOURS.Monday.breakMinutes;

    setMessage('');
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          startTime,
          endTime,
          breakMinutes,
          location: locationFilter,
          roleTag: ROLE_OPTIONS[0],
          notes: '',
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          await loadData();
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to add shift');
      }

      report(`Added regular shift for ${user?.name || 'staff member'}.`);
      await loadData();
    } catch (error) {
      report(error instanceof Error ? error.message : 'Failed to add shift.', true);
    }
  };

  const handlePublish = async () => {
    const weekLabel = `${formatDMY(weekDays[0].date)} - ${formatDMY(weekDays[6].date)}`;
    if (!window.confirm(`Publish ${draftCount} draft shift(s) for ${weekLabel}? Each affected staff member will be emailed their weekly roster.`)) return;

    setPublishing(true);
    setMessage('');
    try {
      const response = await fetch('/api/roster/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: localDate(mondayOf(weekStart)), location: locationFilter }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to publish roster');

      report(
        `Published ${data.published} shift(s). Emailed ${data.emailed} of ${data.staff} staff.${data.emailIssue ? ` ${data.emailIssue}` : ''}`,
        Boolean(data.emailIssue)
      );
      await loadData();
    } catch (error) {
      report(error instanceof Error ? error.message : 'Failed to publish roster.', true);
    } finally {
      setPublishing(false);
    }
  };

  const handleFillRegular = async () => {
    setFilling(true);
    setMessage('');
    try {
      const response = await fetch('/api/roster/fill-regular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: localDate(mondayOf(weekStart)), location: locationFilter }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fill from regular hours');

      report(
        data.created
          ? `Added ${data.created} draft shift(s) from regular hours. Publish the roster when it is ready.`
          : 'Every staff member with regular hours already has a shift for those days.'
      );
      await loadData();
    } catch (error) {
      report(error instanceof Error ? error.message : 'Failed to fill from regular hours.', true);
    } finally {
      setFilling(false);
    }
  };

  const editShift = (shift: Shift) => {
    const location = shift.location?.code || 'SHA';
    setLocationFilter(location);
    setEditingId(shift.id);
    setRepeatWeeks(1);
    setFormData({
      userId: shift.userId,
      startTime: perthDateTime(shift.startTime),
      endTime: perthDateTime(shift.endTime),
      breakMinutes: shift.breakMinutes,
      location,
      roleTag: shift.roleTag || ROLE_OPTIONS[0],
      notes: shift.notes || '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setFormError('');
    if (!availableUsers.some((user) => user.id === formData.userId)) {
      setFormError('That staff member already has a shift on that day.');
      return;
    }
    const method = editingId ? 'PUT' : 'POST';
    let skippedRepeats = 0;

    try {
      const response = await fetch('/api/shifts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData, id: editingId,
          startTime: parseRosterTime(formData.startTime).toISOString(),
          endTime: parseRosterTime(formData.endTime).toISOString(),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save shift');
      }

      if (!editingId && repeatWeeks > 1) {
        const start = parseRosterTime(formData.startTime);
        const end = parseRosterTime(formData.endTime);
        for (let week = 1; week < repeatWeeks; week += 1) {
          const repeatedStart = new Date(start);
          const repeatedEnd = new Date(end);
          repeatedStart.setUTCDate(repeatedStart.getUTCDate() + week * 7);
          repeatedEnd.setUTCDate(repeatedEnd.getUTCDate() + week * 7);
          const repeatResponse = await fetch('/api/shifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, startTime: repeatedStart.toISOString(), endTime: repeatedEnd.toISOString() }),
          });
          if (!repeatResponse.ok) skippedRepeats += 1;
        }
      }

      const saved = editingId ? 'Shift updated as a draft.' : repeatWeeks > 1 ? `Shift saved as a draft for ${repeatWeeks - skippedRepeats} of ${repeatWeeks} weeks.` : 'Shift saved as a draft.';
      report(`${saved} Publish the roster when it is ready.`);
      resetForm();
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save shift.');
    }
  };

  const handleDeleteShift = async () => {
    if (!editingId) return;

    const shift = shifts.find((item) => item.id === editingId);
    const shiftDate = shift ? formatDMY(new Date(`${perthDate(shift.startTime)}T12:00:00`)) : 'this date';
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
      report('Shift deleted.');
      await loadData();
    } catch (error) {
      report(error instanceof Error ? error.message : 'Failed to delete shift.', true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
          <h1 className="mt-1 text-3xl font-serif text-stone-900">Upcoming roster</h1>
        </div>
        <div className="admin-responsive-form flex w-full min-w-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
          <label className="grid min-w-0 gap-1 text-sm font-semibold text-stone-700">
            Week starting Monday
            <input
              type="date"
              value={weekStart}
              onChange={(event) => setWeekStart(localDate(mondayOf(event.target.value)))}
              className="min-w-0 max-w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal shadow-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const date = weekDays[0].date;
              const dayKey = dateKey(date);
              const staff = locationUsers.find((user) =>
                user.status !== 'INACTIVE' &&
                !shifts.some((shift) =>
                  shift.userId === user.id && perthDate(shift.startTime) === dayKey
                )
              );
              if (!staff) {
                report('No staff are available for Monday at this venue.', true);
                return;
              }
              openShiftForm(staff.id, date);
            }}
            disabled={assignableUsers.length === 0}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            Add shift
          </button>
        </div>
      </div>

      {message && (
        <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${isError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

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
          <button type="button" onClick={handleFillRegular} disabled={filling} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">
            {filling ? 'Filling...' : 'Fill from regular hours'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || draftCount === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : draftCount > 0 ? `Publish roster (${draftCount} draft${draftCount === 1 ? '' : 's'})` : 'Publish roster'}
          </button>
        </div>
      </div>

      <p className="text-xs text-stone-500 xl:hidden">Swipe dates sideways. Staff names stay fixed; scroll down for more staff.</p>
      <section role="region" aria-label="Scrollable weekly staff roster" tabIndex={0} className="admin-calendar-scroll overflow-x-auto rounded-xl border border-stone-300 bg-white">
        <table role="table" aria-label="Weekly staff roster" className="admin-calendar-table admin-roster-calendar w-full min-w-[1100px] table-fixed border-collapse text-left">
          <thead className="bg-stone-50">
            <tr>
              <th className="sticky left-0 z-20 w-48 border-b border-r border-stone-300 bg-stone-50 px-4 py-3 text-xs font-bold uppercase text-stone-500">Staff</th>
              {weekDays.map((day) => (
                <th key={day.key} className="border-b border-r border-stone-300 px-3 py-3 text-center last:border-r-0">
                  <span className="block text-sm font-bold text-stone-800">{day.name.slice(0, 3)}</span>
                  <span className="mt-1 block text-xs font-normal text-stone-500">{formatDMY(day.date)}</span>
                  {WA_PUBLIC_HOLIDAYS[day.key] && (
                    <span className="mt-2 block rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-900">
                      Public holiday: {WA_PUBLIC_HOLIDAYS[day.key]}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-stone-500">Loading roster...</td></tr>
            ) : rosterUsers.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-stone-500">No staff are assigned to this venue.</td></tr>
            ) : rosterUsers.map((user) => (
              <tr key={user.id}>
                <th scope="row" className="sticky left-0 z-10 w-48 border-r border-stone-200 bg-white px-4 py-3 align-top">
                  <span className="block text-sm font-semibold text-stone-900">{user.name || 'Unnamed staff'}</span>
                  <span className="mt-1 block text-xs font-normal text-stone-500">{user.employmentType?.replaceAll('_', ' ') || 'Staff'}</span>
                  {user.status === 'INACTIVE' && (
                    <span className="mt-1 inline-block rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Inactive</span>
                  )}
                </th>
                {shiftsByDay.map((day) => {
                  const userLeave = leave.filter((entry) => entry.userId === user.id && entry.workDate.slice(0, 10) === day.key);
                  const showShifts = !WA_PUBLIC_HOLIDAYS[day.key] && userLeave.length === 0;
                  const userShifts = shifts.filter((shift) =>
                    shift.userId === user.id && perthDate(shift.startTime) === day.key
                  );
                  const regular = user.status === 'INACTIVE'
                    ? null
                    : regularHoursFor(user.regularWorkingHours, WORKING_DAYS[(day.date.getDay() + 6) % 7]);
                  return (
                    <td key={`${user.id}-${day.key}`} data-label={`${day.name} ${formatDMY(day.date)}`} className="h-28 border-r border-stone-200 p-2 align-top last:border-r-0">
                      <div className="flex min-h-24 flex-col gap-2">
                        {userLeave.map((entry) => <RosterLeaveCard key={entry.id} leave={entry} />)}
                        {showShifts && userShifts.map((shift) => {
                          return (
                            <button
                              key={shift.id}
                              type="button"
                              onClick={() => editShift(shift)}
                              className={`w-full rounded-md border p-2 text-left transition hover:shadow-sm ${shift.publishedAt ? 'border-green-300 bg-green-100 text-green-950 hover:bg-green-200' : 'border-amber-300 border-dashed bg-amber-100 text-amber-950 hover:bg-amber-200'}`}
                            >
                              <span className="block text-xs font-bold">
                                {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                              </span>
                              {shift.roleTag && <span className="mt-1 block text-xs text-stone-700">{shift.roleTag}</span>}
                              {shift.breakMinutes > 0 && <span className="mt-1 block text-[11px] text-stone-600">{shift.breakMinutes} min break</span>}
                              {shift.location?.code !== locationFilter && shift.location?.name && (
                                <span className="mt-1 block text-[11px] text-stone-600">{shift.location.name}</span>
                              )}
                            </button>
                          );
                        })}
                        {showShifts && userShifts.length === 0 && regular ? (
                          <div className="group relative w-full rounded-md border border-dashed border-stone-300 bg-stone-50 p-2 text-left text-stone-500 transition hover:border-sky-500 hover:bg-sky-50">
                            <span className="block text-xs font-semibold text-stone-700 group-hover:text-sky-900">
                              {formatClock(regular.startTime)} - {formatClock(regular.endTime)}
                            </span>
                            <span className="mt-1 block text-[11px] text-stone-500 group-hover:text-sky-700">
                              Regular hours
                            </span>

                            {/* Hover Overlay with Action Button */}
                            <div className="admin-touch-actions absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-stone-900/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                              <button
                                type="button"
                                onClick={() => addSingleRegularShift(user.id, day.date)}
                                title="Add this regular shift instantly"
                                className="rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                              >
                                + Add
                              </button>
                              <button
                                type="button"
                                onClick={() => openShiftForm(user.id, day.date)}
                                title="Edit details before saving"
                                className="rounded bg-stone-900 px-2 py-1 text-xs font-semibold text-stone-200 hover:bg-stone-600 hover:text-white"
                              >
                                + Edit
                              </button>
                            </div>
                          </div>
                        ) : showShifts && userShifts.length === 0 && user.status !== 'INACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => openShiftForm(user.id, day.date)}
                            aria-label={`Add ${user.name || 'staff'} shift on ${day.name}`}
                            className="flex min-h-8 w-full flex-1 items-center justify-center rounded-md border border-dashed border-stone-300 text-xl font-medium text-stone-400 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                          >
                            +
                          </button>
                        ) : null}
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
          <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="shift-form-title" className="admin-responsive-form max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-2xl space-y-5 overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
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
              <p role="alert" className="text-sm text-rose-700">This staff member already has a shift on that day.</p>
            )}
            {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
              {editingId ? (
                <button type="button" onClick={handleDeleteShift} disabled={deleting} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete shift'}
                </button>
              ) : <span />}
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={resetForm} disabled={deleting} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={deleting || loading || availableUsers.length === 0 || !availableUsers.some((user) => user.id === formData.userId)} className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {editingId ? 'Save changes' : 'Save as draft'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
