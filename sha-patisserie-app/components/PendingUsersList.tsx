'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export default function PendingUsersList({ initialUsers }: { initialUsers: User[] }) {
  // Store the list of pending users in state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(userId: string) {
    setLoadingId(userId);

    try {
      // Call the API endpoint created in Part 1
      const res = await fetch('/api/admin/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        // Remove the approved user from screen without reloading the page
        setUsers(users.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setLoadingId(null);
    }
  }

  // Display empty state if no pending users exist
  if (users.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 border border-stone-200/80 rounded-2xl">
        <p className="text-xs text-stone-500">No staff members are currently awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm"
        >
          <div>
            <p className="text-sm font-medium text-stone-800">{user.name || 'Unnamed Staff'}</p>
            <p className="text-xs text-stone-500">{user.email}</p>
          </div>
          <button
            onClick={() => handleApprove(user.id)}
            disabled={loadingId === user.id}
            className="px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-xl transition-all disabled:opacity-50"
          >
            {loadingId === user.id ? 'Approving...' : 'Approve Staff'}
          </button>
        </div>
      ))}
    </div>
  );
}