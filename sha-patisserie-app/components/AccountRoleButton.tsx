'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountRoleButton({ userId, name, role, onMoved }: {
  userId: string;
  name: string;
  role: 'STAFF' | 'ADMIN';
  onMoved?: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const label = role === 'ADMIN' ? 'Admin' : 'Staff';

  async function move() {
    if (!window.confirm(`Move ${name} to ${label}? ${role === 'ADMIN' ? 'This grants full Admin access and removes them from shift scheduling.' : 'This removes Admin access and returns them to the staff roster for their assigned venue.'} Existing records will be retained.`)) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change account role.');
      onMoved?.();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change account role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-2">
      <button type="button" onClick={move} disabled={saving} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50">
        {saving ? 'Moving...' : `Move to ${label}`}
      </button>
      {error && <span role="alert" className="text-xs text-rose-700">{error}</span>}
    </span>
  );
}
