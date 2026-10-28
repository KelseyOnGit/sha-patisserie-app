'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function LogoutButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout request failed');
      }
      await queryClient.cancelQueries();
      queryClient.clear();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full px-3 py-2 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 transition-colors disabled:opacity-60"
    >
      {loading ? 'Logging out...' : children}
    </button>
  );
}