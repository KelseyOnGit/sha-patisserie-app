'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface AttendanceRow {
  id: string;
  staffName: string;
  site: string;
  scheduled: string;
  actualArrival: string | null;
  status: string;
}

function getPerthToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default function AdminDashboardPage() {
  const [selectedDate] = useState<string>(getPerthToday());
  const weekday = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    weekday: 'long',
  }).format(new Date(`${selectedDate}T12:00:00+08:00`));
  const displayDate = `${weekday} ${selectedDate.split('-').reverse().join('-')}`;

  // Fetch admin stats counts
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch live attendance data with 15s polling
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['admin-attendance', selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/admin/attendance?date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const pendingCount = statsData?.pendingUsers || 0;
  const rows: AttendanceRow[] = attendanceData?.rows || [];

  const clockedInCount = rows.filter((r) => r.status === 'CLOCKED_IN').length;
  const onBreakCount = rows.filter((r) => r.status === 'ON_BREAK').length;
  const lateCount = rows.filter((r) => r.status === 'LATE').length;
  const absenceCount = rows.filter((r) => r.status === 'POSSIBLE_ABSENCE').length;

  const activeStaffOnShift = rows.filter((r) => r.status === 'CLOCKED_IN' || r.status === 'ON_BREAK');
  const lateOrAbsentStaff = rows.filter((r) => r.status === 'LATE' || r.status === 'POSSIBLE_ABSENCE');

  const stats = [
    { label: 'Active staff', value: statsData?.totalStaff ?? '—', href: '/admin/staff' },
    { label: 'Pending users', value: pendingCount, href: '/admin/users' },
    { label: 'Upcoming shifts (7d)', value: statsData?.upcomingShifts ?? '—', href: '/admin/roster' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
        <h1 className="mt-1 text-3xl font-serif text-stone-900">Dashboard</h1>
      </div>

      {/* Top Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-stone-400">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-serif text-stone-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/roster" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700">Manage weekly roster</Link>
          <Link href="/admin/users" className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">
             <span>Review pending users</span>
             {pendingCount > 0 && (
               <span className="ml-2 inline-block rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                 {pendingCount}
               </span>
             )}
          </Link>
          <Link href="/admin/staff" className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">Staff profiles</Link>
          <Link href="/admin/reports" className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">Payroll reports</Link>
        </div>
      </div>

      {/* Live Attendance Summary Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Today's Attendance</h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live updates
            </span>
          </div>
          <span className="text-xs text-stone-500">{displayDate}</span>
        </div>

        {/* Live Notification Banners */}
        {activeStaffOnShift.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="text-base">🟢</span>
              <span>
                <strong>Currently on shift:</strong>{' '}
                {activeStaffOnShift.map((s) => `${s.staffName} (${s.status === 'ON_BREAK' ? 'On break' : 'Clocked in'})`).join(', ')}
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
              {activeStaffOnShift.length} Active
            </span>
          </div>
        )}

        {lateOrAbsentStaff.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>Attendance attention:</strong>{' '}
                {lateOrAbsentStaff.map((s) => `${s.staffName} (${s.status === 'POSSIBLE_ABSENCE' ? 'Absent' : 'Late'})`).join(', ')}
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-1 rounded">
              Needs review
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs font-bold text-green-800 uppercase">Clocked in</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{clockedInCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-xs font-bold text-yellow-800 uppercase">On break</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{onBreakCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <p className="text-xs font-bold text-orange-800 uppercase">Late</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">{lateCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-bold text-red-800 uppercase">Possible absence</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{absenceCount}</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[11px] tracking-wider">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Scheduled</th>
                <th className="p-4">Actual Arrival</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-500">
                    Loading live attendance...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-500">
                    No active attendance or scheduled shifts found for today.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-stone-100">
                    <td className="p-4 font-semibold text-stone-900">{r.staffName}</td>
                    <td className="p-4 text-stone-600">{r.site}</td>
                    <td className="p-4 text-stone-600">{r.scheduled}</td>
                    <td className="p-4 text-stone-600">{r.actualArrival || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                          r.status === 'CLOCKED_IN'
                            ? 'bg-green-100 text-green-800'
                            : r.status === 'ON_BREAK'
                            ? 'bg-yellow-100 text-yellow-800'
                            : r.status === 'LATE'
                            ? 'bg-orange-100 text-orange-800'
                            : r.status === 'POSSIBLE_ABSENCE'
                            ? 'bg-red-100 text-red-800'
                            : r.status === 'COMPLETED'
                            ? 'bg-stone-100 text-stone-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}