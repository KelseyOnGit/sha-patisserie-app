'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isEffectiveLeave, perthToday } from '@/lib/leave';

interface ClockInCardProps {
  userName?: string;
}

interface BreakShift {
  id: string;
  startBreak: string | null;
  endBreak: string | null;
  presetBreakMinutes: number;
}

interface UpcomingShift {
  id: string;
  venue: string;
  day: string;
  startTime: string;
  endTime: string;
}

export default function ClockInCard({ userName = 'Team Member' }: ClockInCardProps) {
  const [time, setTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [venue, setVenue] = useState<string>('Sha');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [breakShift, setBreakShift] = useState<BreakShift | null>(null);
  const [breakStatusError, setBreakStatusError] = useState('');
  const [breakSeconds, setBreakSeconds] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [upcomingShift, setUpcomingShift] = useState<UpcomingShift | null>(null);
  const statusRequest = useRef(0);
  const actionInFlight = useRef(false);
  const [leaveToday, setLeaveToday] = useState(false);
  const [rosterError, setRosterError] = useState('');

  // Update live clock on client side
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentDate(new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Perth',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now));
      setTime(new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Perth',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadBreakStatus = useCallback(() => {
    if (actionInFlight.current) return;
    const requestId = ++statusRequest.current;
    return fetch('/api/shifts/breaks', { cache: 'no-store' }).then(async (res) => {
      const data = await res.json();
      if (requestId !== statusRequest.current) return;
      if (!res.ok) throw new Error(data.error || 'Unable to load break status.');
      setBreakShift(data.session || null);
      setIsClockedIn(Boolean(data.session));
      setBreakStatusError('');
    }).catch((error: unknown) => {
      if (requestId !== statusRequest.current) return;
      console.error('Failed to load break status:', error);
      setBreakStatusError(error instanceof Error ? error.message : 'Unable to load break status.');
    });
  }, []);

  useEffect(() => {
    void loadBreakStatus();
    const refresh = () => { void loadBreakStatus(); };
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 30000);
    return () => { window.removeEventListener('focus', refresh); clearInterval(interval); };
  }, [loadBreakStatus]);

  useEffect(() => {
    if (!breakShift?.startBreak || breakShift.endBreak) {
      return;
    }

    const updateBreakTimer = () => {
      const elapsed = Math.floor((Date.now() - new Date(breakShift.startBreak as string).getTime()) / 1000);
      const limit = breakShift.presetBreakMinutes * 60;
      setBreakSeconds(Math.max(limit - elapsed, 0));
    };

    updateBreakTimer();
    const interval = setInterval(updateBreakTimer, 1000);
    return () => clearInterval(interval);
  }, [breakShift]);

  const handleBreakToggle = async () => {
    if (!breakShift) {
      setStatusMessage('Clock in before recording a break.');
      return;
    }

    setLoading(true);
    actionInFlight.current = true;
    statusRequest.current++;
    const action = breakShift.startBreak && !breakShift.endBreak ? 'FINISH' : 'START';

    try {
      const res = await fetch('/api/shifts/breaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: breakShift.id, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.error || 'Unable to update break.');
      } else {
        setBreakShift(data.session);
        setStatusMessage(action === 'START' ? 'Break started successfully.' : 'Break finished successfully.');
      }
    } catch {
      setStatusMessage('Unable to connect to the server.');
    } finally {
      actionInFlight.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const res = await fetch('/api/roster/mine', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load roster.');
        if (!Array.isArray(data.shifts) || !Array.isArray(data.leave)) throw new Error('Invalid roster response.');
        if (!active) return;
        setUpcomingShift(data.shifts[0] ?? null);
        setLeaveToday(data.leave.some((entry: { date: string; status: string }) =>
          entry.date === perthToday().toISOString().slice(0, 10) && isEffectiveLeave(entry.status)));
        setRosterError('');
      } catch (error) {
        if (!active) return;
        console.error('Failed to load upcoming shift:', error);
        setRosterError(error instanceof Error ? error.message : 'Unable to load roster.');
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 60000);
    return () => { active = false; window.removeEventListener('focus', refresh); clearInterval(interval); };
  }, []);

  const handleClockAction = async (action: 'in' | 'out') => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    actionInFlight.current = true;
    statusRequest.current++;

    const submitClockAction = async (userLat: number, userLng: number) => {
      try {
        const res = await fetch('/api/shifts/clock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action === 'in' ? 'clock-in' : 'clock-out',
            location: venue === 'Zushi Bento' ? 'ZB' : venue === 'Test' ? 'Test' : 'Sha',
            userLat,
            userLng,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 400 && data.error === 'You are already clocked in!') {
              setIsClockedIn(true);
            }
          alert(data.error || 'Failed to process request');
        } else {
          setIsClockedIn(action === 'in');
            setStatusMessage(action === 'in' ? 'You have successfully clocked in.' : 'You have successfully clocked out.');
            if (action === 'out') setBreakShift(null);
        }
      } catch (err) {
        console.error('Clocking error:', err);
        alert('An error occurred while connecting to the server.');
      } finally {
        actionInFlight.current = false;
        await loadBreakStatus();
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => submitClockAction(position.coords.latitude, position.coords.longitude),
      (error) => {
        const errorMessage =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Your device could not determine its location.'
              : 'Location lookup timed out.';

        console.error('Geolocation error:', error.code, error.message);

        if (process.env.NEXT_PUBLIC_GPS_TEST_MODE === 'true') {
          submitClockAction(-31.9056, 115.9392);
          return;
        }

        alert(`${errorMessage} Please allow location access and try again.`);
        actionInFlight.current = false;
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EADBC8] rounded-3xl p-6 shadow-sm">
      {/* Live Digital Clock Badge */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#EAE3D2] text-stone-700 px-4 py-2 rounded-xl text-center">
          <div className="text-[11px] font-semibold text-stone-600">{currentDate || 'Loading date...'}</div>
          <div className="mt-1 flex items-center justify-center gap-2 font-mono text-xs tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {time || '12:00:00 PM'}
          </div>
        </div>
      </div>

      {/* Venue Location Dropdown */}
      <div className="mb-5">
        <label htmlFor="venue-select" className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
          Venue Location
        </label>
        <div className="relative">
          <select
            id="venue-select"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full py-3.5 px-4 pr-10 rounded-2xl text-sm font-bold bg-[#EADBC8] text-stone-800 border border-[#D8C4B6] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="Sha">📍 Sha Patisserie</option>
            <option value="Zushi Bento">📍 Zushi Bento</option>
            {process.env.NEXT_PUBLIC_GPS_TEST_MODE === 'true' && (
  <option value="Test">🧪 Office (Test)</option>
)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-700">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* User & Status Bar */}
      <div className="bg-[#EAE3D2]/60 rounded-2xl p-4 flex justify-between items-center mb-4">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Logged in as
          </span>
          <span className="text-sm font-bold text-stone-800">{userName}</span>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
            isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
          }`}>
            {isClockedIn ? 'Clocked In' : 'Clocked Out'}
          </span>
        </div>
      </div>

      {/* Upcoming Shift Info */}
      {leaveToday && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
        You are on approved leave today. No clock-in is required.
      </p>}
      {rosterError && <p role="alert" className="mb-4 text-sm text-rose-700">Could not refresh your roster: {rosterError}</p>}
      <div className="mb-6 rounded-2xl bg-[#EAE3D2]/40 border border-[#D8C4B6]/60 p-4 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Upcoming Shift</span>
          {upcomingShift && (
            <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full">
              Scheduled
            </span>
          )}
        </div>
        {upcomingShift ? (
          <div>
            <p className="text-sm font-bold text-stone-800">
              {upcomingShift.day} • {upcomingShift.startTime} - {upcomingShift.endTime}
            </p>
            <p className="text-xs text-stone-600 mt-1">📍 {upcomingShift.venue}</p>
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">No upcoming shifts scheduled soon.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleClockAction('in')}
          disabled={loading || isClockedIn}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50 transition-all"
        >
          {loading ? '...' : leaveToday ? 'Clock In if Working' : 'Clock In'}
        </button>

        <button
          onClick={() => handleClockAction('out')}
          disabled={loading || !isClockedIn || Boolean(breakShift?.startBreak && !breakShift.endBreak) || Boolean(breakStatusError)}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-200 hover:bg-rose-300 text-rose-900 shadow-sm disabled:opacity-50 transition-all"
        >
          {loading ? '...' : 'Clock Out'}
        </button>
      </div>

      {isClockedIn && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <button
            onClick={handleBreakToggle}
            disabled={loading || !breakShift || Boolean(breakShift.endBreak) || Boolean(breakStatusError)}
            className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {breakShift?.endBreak
              ? 'Break Recorded'
              : breakShift?.startBreak
                ? 'End Break'
                : 'Start Break'}
          </button>
          {breakShift?.startBreak && !breakShift.endBreak && (
            <p className="mt-2 text-xs font-semibold text-amber-800">
              {Math.floor(breakSeconds / 60)}:{String(breakSeconds % 60).padStart(2, '0')} remaining
            </p>
          )}
          {!breakShift && (
            <p className="mt-2 text-xs text-amber-800">No active clock-in session. Refresh your status or clock in first.</p>
          )}
        </div>
      )}

      {breakStatusError && <p role="alert" className="mt-3 text-center text-xs text-rose-700">
        {breakStatusError} <button type="button" onClick={() => void loadBreakStatus()} className="underline">Retry status</button>
      </p>}
      {statusMessage && (
        <p role="status" className="mt-3 text-center text-xs font-semibold text-stone-700">{statusMessage}</p>
      )}

      <p className="text-center text-[11px] text-stone-400 mt-4">
        Onsite location required
      </p>
    </div>
  );
}