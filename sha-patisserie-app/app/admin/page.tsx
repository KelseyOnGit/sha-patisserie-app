import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalStaff, pendingUsers, upcomingShifts] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'PENDING' } }),
    prisma.shift.count({ where: { startTime: { gte: now, lt: weekFromNow } } }),
  ]);

  const pendingCount = pendingUsers;

  const stats = [
    { label: 'Active staff', value: totalStaff, href: '/admin/staff' },
 
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Admin scheduling</p>
        <h1 className="mt-1 text-3xl font-serif text-stone-900">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-stone-400">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-serif text-stone-900">{stat.value}</p>
          </Link>
        ))}
      </div>

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
    </div>
  );
}