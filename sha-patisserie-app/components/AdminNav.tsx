'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminNav({
  role,
  pendingCount,
  children,
}: {
  role?: string;
  pendingCount: number;
  children: React.ReactNode; // the logout button, passed in from the server layout
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const link = 'block py-2 text-sm hover:text-stone-300 md:py-0';

  return (
    <aside className="sticky top-0 z-30 w-full bg-stone-900 text-stone-100 md:static md:flex md:w-64 md:flex-col md:justify-between md:p-6">
      {/* Top bar: always visible. On phones it holds the Menu button. */}
      <div className="flex items-center justify-between px-4 py-3 md:block md:p-0">
        <h2 className="font-serif text-lg md:mb-6">Admin Panel</h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="relative rounded-md border border-stone-600 px-3 py-2 text-sm font-semibold md:hidden"
        >
          {open ? 'Close' : 'Menu'}
          {!open && pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-600" aria-label={`${pendingCount} pending users`} />
          )}
        </button>
      </div>

      {/* Links: hidden on phones until the button is tapped, always shown on desktop. */}
      <div
        id="admin-menu"
        className={`${open ? 'block' : 'hidden'} max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-4 md:flex md:max-h-none md:flex-1 md:flex-col md:justify-between md:overflow-visible md:p-0`}
      >
        <nav className="space-y-1 md:space-y-4">
          <Link href="/admin" onClick={close} className={link}>Dashboard</Link>
          <Link href="/admin/roster" onClick={close} className={link}>Roster</Link>
          <Link href="/admin/staff" onClick={close} className={link}>Staff Profiles</Link>
          {role === 'ADMIN' && (
            <Link href="/admin/admin-users" onClick={close} className={link}>Admin Users</Link>
          )}
          <Link href="/admin/reports" onClick={close} className={link}>Payroll Reports</Link>
          <Link href="/admin/leave" onClick={close} className={link}>Leave Requests</Link>
          <Link href="/admin/users" onClick={close} className={`${link} flex items-center justify-between`}>
            <span>Pending Users</span>
            {pendingCount > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-bold text-white shadow-xs">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="mt-4 border-t border-stone-800 pt-4 md:mt-6 md:pt-6">{children}</div>
      </div>
    </aside>
  );
}
