'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import AccountRoleButton from '@/components/AccountRoleButton';

interface StaffMember {
  id: string;
  name: string | null;
  email: string | null;
  location: { code: 'SHA' | 'ZB'; name: string } | null;
  status: string;
  isApproved: boolean;
}

export default function StaffListPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const query = search.trim().toLowerCase();
  const filteredStaff = staffList.filter((staff) =>
    (statusFilter === 'ALL' || staff.status === statusFilter) &&
    (staff.name || 'Unnamed Staff').toLowerCase().includes(query)
  ).sort((a, b) => Number(a.status === 'INACTIVE') - Number(b.status === 'INACTIVE'));

  useEffect(() => {
    async function fetchStaff() {
      try {
        const [res, sessionResponse] = await Promise.all([fetch('/api/users'), fetch('/api/auth/me')]);
        const data = await res.json();
        const sessionData = await sessionResponse.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load staff.');
        if (!sessionResponse.ok) throw new Error(sessionData.error || 'Failed to load account permissions.');
        if (!Array.isArray(data)) throw new Error('Invalid staff response.');
        setStaffList(data);
        setCanManageRoles(sessionData.user?.role === 'ADMIN');
      } catch (err) {
        console.error('Failed to load staff list', err);
        setMessage(err instanceof Error ? err.message : 'Failed to load staff list.');
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  const updateLocation = async (userId: string, location: string) => {
    setSavingId(userId);
    setMessage('');

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, location }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update venue');

      setStaffList((current) => current.map((staff) =>
        staff.id === userId ? { ...staff, location: data.location } : staff
      ));
      setMessage('Venue updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update venue.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Admin Panel
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">Staff Profiles</h1>
        </div>
      </div>

      {message && <p role="status" className="text-sm text-stone-600">{message}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-1 text-sm font-medium text-stone-700 sm:w-80">
          Search staff name
          <input type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name..."
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">
          Staff status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
            <option value="ACTIVE">Show Active</option>
            <option value="INACTIVE">Show Inactive</option>
            <option value="ALL">Show All</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading staff members...</p>
        ) : staffList.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">No staff members found.</p>
        ) : filteredStaff.length === 0 ? (
          <p role="status" className="p-6 text-sm text-stone-500">No staff members match your search and status filter.</p>
        ) : (
          <table role="table" aria-label="Staff profiles" className="admin-responsive-table w-full text-left text-sm text-stone-700">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStaff.map((staff, index) => (
                <Fragment key={staff.id}>
                {statusFilter === 'ALL' && staff.status === 'INACTIVE' &&
                  (index === 0 || filteredStaff[index - 1].status !== 'INACTIVE') && (
                  <tr><td colSpan={5} className="bg-rose-50 px-6 py-2 text-xs font-bold uppercase tracking-wide text-rose-700">Inactive staff</td></tr>
                )}
                <tr className={staff.status === 'INACTIVE' ? 'bg-rose-50 hover:bg-rose-100 transition' : 'hover:bg-stone-50/80 transition'}>
                  <td data-label="Name" className="px-6 py-4 font-semibold text-stone-900">
                    {staff.name || 'Unnamed Staff'}
                  </td>
                  <td data-label="Email" className="px-6 py-4 text-stone-600">{staff.email || '-'}</td>
                  <td data-label="Location" className="px-6 py-4">
                    <select
                      aria-label={`Venue for ${staff.name || 'unnamed staff'}`}
                      value={staff.location?.code || ''}
                      disabled={savingId === staff.id}
                      onChange={(event) => updateLocation(staff.id, event.target.value)}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
                    >
                      <option value="">Unassigned</option>
                      <option value="SHA">Sha Patisserie</option>
                      <option value="ZB">Zushi Bento</option>
                    </select>
                  </td>
                  <td data-label="Status" className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${staff.status === 'INACTIVE' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/staff/${staff.id}`}
                      className="shrink-0 overflow-x-auto rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-100 transition"
                    >
                      View Profile
                    </Link>
                    {canManageRoles && staff.isApproved && (
                      <span className="ml-3 inline-block">
                        <AccountRoleButton userId={staff.id} name={staff.name || staff.email || 'this user'} role="ADMIN" onMoved={() => {
                          setStaffList((current) => current.filter((person) => person.id !== staff.id));
                          setMessage('Account moved to Admin Users.');
                        }} />
                      </span>
                    )}
                  </td>
                </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}