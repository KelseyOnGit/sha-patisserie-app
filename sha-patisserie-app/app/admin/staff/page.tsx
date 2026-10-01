'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string | null;
  email: string | null;
  location: { code: 'SHA' | 'ZB'; name: string } | null;
  status: string;
}

export default function StaffListPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (Array.isArray(data)) {
          setStaffList(data);
        }
      } catch (err) {
        console.error('Failed to load staff list', err);
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

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading staff members...</p>
        ) : staffList.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">No staff members found.</p>
        ) : (
          <table className="w-full text-left text-sm text-stone-700">
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
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-stone-50/80 transition">
                  <td className="px-6 py-4 font-semibold text-stone-900">
                    {staff.name || 'Unnamed Staff'}
                  </td>
                  <td className="px-6 py-4 text-stone-600">{staff.email || '-'}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/staff/${staff.id}`}
                      className="shrink-0 overflow-x-auto rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-100 transition"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}