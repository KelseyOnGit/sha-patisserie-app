'use client';

import { useEffect, useState } from 'react';
import { isLiveAttendance, type ReviewRow } from '@/lib/timesheets';

export default function PayrollBreakStatus({ row }: { row: Pick<ReviewRow, 'recordedBreaks' | 'actualBreakMinutes' | 'inProgress' | 'workDate'> }) {
  const [now, setNow] = useState(Date.now);
  const open = (row.recordedBreaks ?? []).filter((entry) => !entry.end);
  const ticking = open.length > 0 && isLiveAttendance(row);
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [ticking]);

  if (ticking) {
    const seconds = open.reduce((sum, entry) =>
      sum + Math.max(0, Math.floor((now - new Date(entry.start).getTime()) / 1000)), 0);
    return <span className="font-semibold text-amber-800">
      On break · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
      {row.actualBreakMinutes !== null && <span className="block text-stone-500">{row.actualBreakMinutes}m completed</span>}
    </span>;
  }
  if (open.length) return <span className="font-semibold text-amber-800">Unfinished break</span>;
  return row.actualBreakMinutes !== null
    ? <span className="font-semibold text-emerald-700">Break taken · {row.actualBreakMinutes}m</span>
    : <span className="text-stone-500">Not recorded</span>;
}
