'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export default function PendingUsersList({ initialUsers, canAssignAdmin = false }: { initialUsers: User[]; canAssignAdmin?: boolean }) {
  const router = useRouter();
  // Store the list of pending users in state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'remove' | null>(null);
  const [roles, setRoles] = useState<Record<string, 'STAFF' | 'ADMIN'>>({});
  const [error, setError] = useState('');

  async function handleApprove(userId: string) {
    setLoadingId(userId);
    setLoadingAction('approve');
    setError('');

    try {
      // Call the API endpoint created in Part 1
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: roles[userId] ?? 'STAFF' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve user.');
      setUsers((current) => current.filter((user) => user.id !== userId));
      router.refresh();
    } catch (error) {
      console.error('Failed to approve user:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve user.');
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  }

  async function handleRemove(user: User) {
    const label = user.name || user.email;
    if (!window.confirm(`Remove ${label}? This deletes their sign-up request and cannot be undone.`)) return;

    setLoadingId(user.id);
    setLoadingAction('remove');
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove user.');
      setUsers((current) => current.filter((item) => item.id !== user.id));
      router.refresh();
    } catch (error) {
      console.error('Failed to remove user:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove user.');
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  }

  // Display empty state if no pending users exist
  if (users.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 border border-stone-200/80 rounded-2xl">
        <p className="text-xs text-stone-500">No users are currently awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col gap-3 p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800">{user.name || 'Unnamed user'}</p>
            <p className="break-all text-xs text-stone-500">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-stone-600">
              Approve as
              <select
                aria-label={`Role for ${user.name || user.email}`}
                value={roles[user.id] ?? 'STAFF'}
                disabled={loadingId !== null}
                onChange={(event) => setRoles((current) => ({ ...current, [user.id]: event.target.value === 'ADMIN' ? 'ADMIN' : 'STAFF' }))}
                className="ml-2 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm"
              >
                <option value="STAFF">Staff</option>
                {canAssignAdmin && <option value="ADMIN">Admin</option>}
              </select>
            </label>
            <button
              type="button"
              onClick={() => handleRemove(user)}
              disabled={loadingId !== null}
              className="px-4 py-2 text-xs font-medium text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
            >
              {loadingId === user.id && loadingAction === 'remove' ? 'Removing...' : 'Remove'}
            </button>
            <button
              type="button"
              onClick={() => handleApprove(user.id)}
              disabled={loadingId !== null}
              className="px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-xl transition-all disabled:opacity-50"
            >
              {loadingId === user.id && loadingAction === 'approve' ? 'Approving...' : `Approve ${roles[user.id] === 'ADMIN' ? 'Admin' : 'Staff'}`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
