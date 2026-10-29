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

function statusClass(status: string): string {
  switch (status) {
    case 'CLOCKED_IN': return 'bg-green-100 text-green-800';
    case 'ON_BREAK': return 'bg-yellow-100 text-yellow-800';
    case 'LATE': return 'bg-orange-100 text-orange-800';
    case 'POSSIBLE_ABSENCE': return 'bg-red-100 text-red-800';
    case 'COMPLETED': return 'bg-stone-100 text-stone-800';
    default: return 'bg-blue-50 text-blue-700';
  }
}

const statusLabel = (status: string) => status.replace(/_/g, ' ');

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
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
        <h1 className="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">Dashboard</h1>
      </div>

      {/* Top Stats Cards */}
      <div data-testid="dashboard-summary" className="hidden gap-4 md:grid md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:border-stone-400 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl text-stone-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-stone-900">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
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
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Today&apos;s Attendance</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
              Live updates
            </span>
          </div>
          <span className="text-xs text-stone-500">{displayDate}</span>
        </div>

        {/* Live Notification Banners (stack on phones) */}
        {activeStaffOnShift.length > 0 && (
          <div className="mb-4 flex flex-col items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <span className="text-base">🟢</span>
              <span className="min-w-0 break-words">
                <strong>Currently on shift:</strong>{' '}
                {activeStaffOnShift.map((s) => `${s.staffName} (${s.status === 'ON_BREAK' ? 'On break' : 'Clocked in'})`).join(', ')}
              </span>
            </div>
            <span className="shrink-0 rounded bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {activeStaffOnShift.length} Active
            </span>
          </div>
        )}

        {lateOrAbsentStaff.length > 0 && (
          <div className="mb-4 flex flex-col items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <span className="text-base">⚠️</span>
              <span className="min-w-0 break-words">
                <strong>Attendance attention:</strong>{' '}
                {lateOrAbsentStaff.map((s) => `${s.staffName} (${s.status === 'POSSIBLE_ABSENCE' ? 'Absent' : 'Late'})`).join(', ')}
              </span>
            </div>
            <span className="shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
              Needs review
            </span>
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-bold uppercase text-green-800">Clocked in</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{clockedInCount}</p>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs font-bold uppercase text-yellow-800">On break</p>
            <p className="mt-1 text-2xl font-bold text-yellow-900">{onBreakCount}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-bold uppercase text-orange-800">Late</p>
            <p className="mt-1 text-2xl font-bold text-orange-900">{lateCount}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase text-red-800">Possible absence</p>
            <p className="mt-1 text-2xl font-bold text-red-900">{absenceCount}</p>
          </div>
        </div>

        {/* Attendance: cards on phones, table from tablet width up */}
        {isLoading ? (
          <p className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
            Loading live attendance...
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
            No active attendance or scheduled shifts found for today.
          </p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => (
                <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-stone-900">{r.staffName}</p>
                    <span className={`shrink-0 rounded px-2.5 py-1 text-xs font-bold ${statusClass(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-sm text-stone-600">
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-stone-400">Venue</dt>
                      <dd className="mt-0.5 break-words">{r.site}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-stone-400">Scheduled</dt>
                      <dd className="mt-0.5 break-words">{r.scheduled}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-stone-400">Arrived</dt>
                      <dd className="mt-0.5 break-words">{r.actualArrival || '—'}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Venue</th>
                    <th className="p-4">Scheduled</th>
                    <th className="p-4">Actual Arrival</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-stone-100">
                      <td className="p-4 font-semibold text-stone-900">{r.staffName}</td>
                      <td className="p-4 text-stone-600">{r.site}</td>
                      <td className="p-4 text-stone-600">{r.scheduled}</td>
                      <td className="p-4 text-stone-600">{r.actualArrival || '—'}</td>
                      <td className="p-4">
                        <span className={`inline-block rounded px-2.5 py-1 text-xs font-bold ${statusClass(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
