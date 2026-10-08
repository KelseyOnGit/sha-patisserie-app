'use client';

import { useState, useEffect } from 'react';
interface WorkingHoursConfig {
  startTime: string;
  endTime: string;
  enabled: boolean;
}
interface Shift {
  id: string;
  location: string;
  startTime: string;
  endTime: string;
  day: string;
  role?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  regularWorkingHours: Record<string, WorkingHoursConfig> | null;
}

// Helper function to format name: "Hannah Gibbs" -> "Hannah G."
function formatShortName(fullName: string | null): string {
  if (!fullName) return 'Unnamed Staff';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function getMonday(d: Date): Date {
  const monday = new Date(d);
  const day = monday.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + offset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function RosterView() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function fetchRoster() {
      try {
        const res = await fetch('/api/roster/mine');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch shifts');
        }

        // Ensure data.shifts is actually an array before saving to state
        if (Array.isArray(data.shifts)) {
          setShifts(data.shifts);
        } else if (Array.isArray(data)) {
          // If your API returns a raw array [...] instead of { shifts: [...] }
          setShifts(data);
        } else {
          setShifts([]);
        }
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
      <h2 className="text-lg font-serif font-bold text-stone-800 mb-1">
        Weekly Roster
      </h2>
      <p className="text-xs text-stone-500 mb-4">Your scheduled shifts</p>

      {loading && (
        <p className="text-center text-xs text-stone-400 py-4">Loading shifts...</p>
      )}

      {error && (
        <p className="text-center text-xs text-rose-500 py-4">{error}</p>
      )}

      {!loading && !error && (!Array.isArray(shifts) || shifts.length === 0) && (
        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 text-center">
          <p className="text-xs font-medium text-stone-500">No shifts scheduled</p>
          <p className="text-[11px] text-stone-400 mt-1">Check back later for updates</p>
        </div>
      )}

      {!loading && !error && Array.isArray(shifts) && shifts.length > 0 && (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center"
            >
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  {shift.day}
                </p>
                <p className="text-sm font-semibold text-stone-800">
                  {shift.location}
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full">
                {shift.startTime} - {shift.endTime}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}