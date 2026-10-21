'use client';

import { useState, useEffect } from 'react';

interface ShiftItem { id: string; date: string; day: string; venue: string; startTime: string; endTime: string }
interface LeaveItem { id: string; date: string; day: string; type: string; status: string; statusLabel: string; hours: number }
interface HolidayItem { date: string; day: string; name: string }

type Entry =
  | { kind: 'holiday'; key: string; date: string; data: HolidayItem }
  | { kind: 'leave'; key: string; date: string; data: LeaveItem }
  | { kind: 'shift'; key: string; date: string; data: ShiftItem };

const ORDER = { holiday: 0, leave: 1, shift: 2 } as const;

export default function RosterView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoster() {
      try {
        const res = await fetch('/api/roster/mine');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch shifts');

        const shifts: ShiftItem[] = Array.isArray(data.shifts) ? data.shifts : [];
        const leave: LeaveItem[] = Array.isArray(data.leave) ? data.leave : [];
        const holidays: HolidayItem[] = Array.isArray(data.holidays) ? data.holidays : [];

        const merged: Entry[] = [
          ...holidays.map((h): Entry => ({ kind: 'holiday', key: `h-${h.date}`, date: h.date, data: h })),
          ...leave.map((l): Entry => ({ kind: 'leave', key: `l-${l.id}`, date: l.date, data: l })),
          ...shifts.map((s): Entry => ({ kind: 'shift', key: `s-${s.id}`, date: s.date, data: s })),
        ].sort((a, b) => a.date.localeCompare(b.date) || ORDER[a.kind] - ORDER[b.kind]);

        setEntries(merged);
      } catch (err: any) {
        setError(err.message || 'Error loading roster');
      } finally {
        setLoading(false);
      }
    }
    fetchRoster();
  }, []);

  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-serif font-bold text-stone-800 mb-1">Upcoming Roster</h2>
      <p className="text-xs text-stone-500 mb-4">Your shifts, leave and WA public holidays</p>

      {loading && <p className="text-center text-xs text-stone-400 py-4">Loading shifts...</p>}
      {error && <p className="text-center text-xs text-rose-500 py-4">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 text-center">
          <p className="text-xs font-medium text-stone-500">No shifts scheduled</p>
          <p className="text-[11px] text-stone-400 mt-1">Check back later for updates</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => {
            if (entry.kind === 'holiday') {
              return (
                <div key={entry.key} className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{entry.data.day}</p>
                    <p className="text-sm font-semibold text-indigo-900">{entry.data.name}</p>
                  </div>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full">Public holiday</span>
                </div>
              );
            }

            if (entry.kind === 'leave') {
              const confirmed = entry.data.status === 'APPROVED';
              return (
                <div
                  key={entry.key}
                  className={`p-3.5 bg-emerald-50 rounded-2xl border flex justify-between items-center ${
                    confirmed ? 'border-emerald-200' : 'border-dashed border-emerald-300'
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{entry.data.day}</p>
                    <p className="text-sm font-semibold text-emerald-900">{entry.data.type}</p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full">
                    {confirmed ? 'On leave' : entry.data.statusLabel}
                  </span>
                </div>
              );
            }

            return (
              <div key={entry.key} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{entry.data.day}</p>
                  <p className="text-sm font-semibold text-stone-800">{entry.data.venue}</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full">
                  {entry.data.startTime} - {entry.data.endTime}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}