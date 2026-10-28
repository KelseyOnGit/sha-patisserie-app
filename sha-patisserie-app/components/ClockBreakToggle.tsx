'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClockBreakToggleProps {
  shiftId?: string;
  initialClockIn?: Date | string | null;
  initialClockOut?: Date | string | null;
  initialStartBreak?: Date | string | null;
  initialEndBreak?: Date | string | null;
}

export default function ClockBreakToggle({
  shiftId,
  initialClockIn,
  initialClockOut,
  initialStartBreak,
  initialEndBreak,
}: ClockBreakToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Active States
  const [clockedIn, setClockedIn] = useState(Boolean(initialClockIn && !initialClockOut));
  const [clockedOut, setClockedOut] = useState(Boolean(initialClockOut));
  const [startBreak, setStartBreak] = useState<Date | null>(
    initialStartBreak ? new Date(initialStartBreak) : null
  );
  const [endBreak, setEndBreak] = useState<Date | null>(
    initialEndBreak ? new Date(initialEndBreak) : null
  );

  const isOnBreak = Boolean(startBreak && !endBreak);

  // Handle Break Action (Start / Finish)
  const handleBreakToggle = async () => {
    setLoading(true);
    const action = isOnBreak ? 'FINISH' : 'START';

    try {
      const status = await fetch('/api/shifts/breaks', { cache: 'no-store' });
      const current = await status.json();
      if (!status.ok) throw new Error(current.error || 'Unable to load break status.');
      if (!current.session) throw new Error('Clock in before recording a break.');
      const res = await fetch('/api/shifts/breaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: current.session.id, action }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === 'START') {
          setStartBreak(new Date(data.session.startBreak));
          setEndBreak(null);
        } else {
          setEndBreak(new Date(data.session.endBreak));
        }
        router.refresh();
      } else {
        alert(data.error || 'Failed to update break status');
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Error updating break.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Clock In / Clock Out Actions
  const handleClockToggle = async (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, shiftId }),
      });

      if (res.ok) {
        if (action === 'CLOCK_IN') {
          setClockedIn(true);
        } else {
          setClockedOut(true);
          setClockedIn(false);
        }
        router.refresh();
      } else {
        alert('Failed to update clock status');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating clock state.');
    } finally {
      setLoading(false);
    }
  };

  if (clockedOut) {
    return (
      <div className="p-4 bg-stone-100 rounded-lg text-center text-stone-600 font-medium">
        Shift Completed for Today
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Step 1: Clock In */}
      {!clockedIn ? (
        <button
          onClick={() => handleClockToggle('CLOCK_IN')}
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : 'Clock In'}
        </button>
      ) : (
        /* 2. Step 2 & 3: Break Actions & Clock Out when Clocked In */
        <div className="flex flex-col gap-3 w-full">
          {/* Break Toggle Button */}
          <button
            onClick={handleBreakToggle}
            disabled={loading || Boolean(endBreak)}
            className={`w-full py-3 font-semibold rounded-lg transition-colors text-white ${
              isOnBreak
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-stone-800 hover:bg-stone-900'
            }`}
          >
            {loading ? 'Updating...' : endBreak ? 'Break Recorded' : isOnBreak ? 'End Break' : 'Start Break'}
          </button>

          {/* Clock Out Button (Disabled while on break) */}
          <button
            onClick={() => handleClockToggle('CLOCK_OUT')}
            disabled={loading || isOnBreak}
            className={`w-full py-3 font-semibold rounded-lg transition-colors ${
              isOnBreak
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Clock Out'}
          </button>

          {isOnBreak && (
            <p className="text-xs text-amber-700 text-center font-medium">
              Please end your break before clocking out.
            </p>
          )}
        </div>
      )}
    </div>
  );
}