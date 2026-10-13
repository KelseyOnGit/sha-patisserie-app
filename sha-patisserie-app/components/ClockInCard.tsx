'use client';

import { useState, useEffect } from 'react';

interface ClockInCardProps {
  userName?: string;
}

interface BreakShift {
  id: string;
  startBreak: string | null;
  endBreak: string | null;
  presetBreakMinutes: number;
  breakMinutes: number;
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
  const [breakSeconds, setBreakSeconds] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [upcomingShift, setUpcomingShift] = useState<UpcomingShift | null>(null);


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

  const loadBreakStatus = async () => {
    try {
      const res = await fetch('/api/shifts/breaks');
      if (!res.ok) return;
      const data = await res.json();
      setBreakShift(data.shift || null);
    } catch (error) {
      console.error('Failed to load break status:', error);
    }
  };

  useEffect(() => {
    loadBreakStatus();
  }, [isClockedIn]);

  useEffect(() => {
    if (!breakShift?.startBreak || breakShift.endBreak) {
      setBreakSeconds(0);
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
      setStatusMessage('No scheduled shift is active for a break.');
      return;
    }

    setLoading(true);
    const action = breakShift.startBreak && !breakShift.endBreak ? 'FINISH' : 'START';

    try {
      const res = await fetch('/api/shifts/breaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId: breakShift.id, action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.error || 'Unable to update break.');
      } else {
        setBreakShift(data.shift);
        setStatusMessage(action === 'START' ? 'Break started successfully.' : 'Break finished successfully.');
      }
    } catch (error) {
      setStatusMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/shifts/clock')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setIsClockedIn(Boolean(data?.activeLog));
      })
      .catch((error) => {
        console.error('Failed to load clock status:', error);
      });

    // Fetch upcoming shift for the logged-in staff
    fetch('/api/roster/mine')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.shifts) && data.shifts.length > 0) {
          setUpcomingShift(data.shifts[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load upcoming shift:', err);
      });
  }, []);

  const handleClockAction = async (action: 'in' | 'out') => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);

    const submitClockAction = async (userLat: number, userLng: number) => {
      try {
        const res = await fetch('/api/shifts/clock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action === 'in' ? 'clock-in' : 'clock-out',
            location: venue === 'Zushi Bento' ? 'ZB' : 'Sha',
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
            await loadBreakStatus();
        }
      } catch (err) {
        console.error('Clocking error:', err);
        alert('An error occurred while connecting to the server.');
      } finally {
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
          {loading ? '...' : 'Clock In'}
        </button>

        <button
          onClick={() => handleClockAction('out')}
          disabled={loading || !isClockedIn}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-200 hover:bg-rose-300 text-rose-900 shadow-sm disabled:opacity-50 transition-all"
        >
          {loading ? '...' : 'Clock Out'}
        </button>
      </div>

      {isClockedIn && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <button
            onClick={handleBreakToggle}
            disabled={loading || !breakShift || Boolean(breakShift.endBreak)}
            className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {breakShift?.endBreak
              ? 'Break Recorded'
              : breakShift?.startBreak
                ? 'End Break'
                : 'Start 30-Minute Break'}
          </button>
          {breakShift?.startBreak && !breakShift.endBreak && (
            <p className="mt-2 text-xs font-semibold text-amber-800">
              {Math.floor(breakSeconds / 60)}:{String(breakSeconds % 60).padStart(2, '0')} remaining
            </p>
          )}
          {!breakShift && (
            <p className="mt-2 text-xs text-amber-800">No scheduled shift is active for a break.</p>
          )}
        </div>
      )}

      {statusMessage && (
        <p className="mt-3 text-center text-xs font-semibold text-emerald-700">{statusMessage}</p>
      )}

      <p className="text-center text-[11px] text-stone-400 mt-4">
        Onsite location required
      </p>
    </div>
  );
}