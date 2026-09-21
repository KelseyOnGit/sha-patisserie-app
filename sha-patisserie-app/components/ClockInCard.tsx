'use client';

import { useState, useEffect } from 'react';

interface ClockInCardProps {
  userName?: string;
}

export default function ClockInCard({ userName = 'Team Member' }: ClockInCardProps) {
  const [time, setTime] = useState<string>('');
  const [venue, setVenue] = useState<string>('Sha');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  // Update live clock on client side
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockAction = async (action: 'in' | 'out') => {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, venue }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to process request');
      } else {
        setIsClockedIn(action === 'in');
      }
    } catch (err) {
      console.error('Clocking error:', err);
      alert('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EADBC8] rounded-3xl p-6 shadow-sm">
      {/* Live Digital Clock Badge */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#EAE3D2] text-stone-700 px-4 py-1.5 rounded-full text-xs font-mono tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {time || '12:00:00 PM'}
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
      <div className="bg-[#EAE3D2]/60 rounded-2xl p-4 flex justify-between items-center mb-6">
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

      <p className="text-center text-[11px] text-stone-400 mt-4">
        Onsite location required
      </p>
    </div>
  );
}