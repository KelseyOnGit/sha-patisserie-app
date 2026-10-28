'use client';

import { useState, type FormEvent } from 'react';

export default function ResendVerificationForm() {
  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pinCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to resend verification email.');
      setMessage(data.message);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to resend verification email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <h2 className="text-lg font-medium text-stone-800">Resend verification email</h2>
      <p className="text-sm text-stone-600">Use your registration email and PIN. Check spam first. You can request a new link once per minute.</p>
      <label className="block text-sm text-stone-700">
        Email address
        <input type="email" autoComplete="email" required value={email}
          onChange={(event) => setEmail(event.target.value)} disabled={loading}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" />
      </label>
      <label className="block text-sm text-stone-700">
        Registration PIN
        <input type="password" autoComplete="current-password" inputMode="numeric"
          pattern="[0-9]{4,6}" required value={pinCode}
          onChange={(event) => setPinCode(event.target.value)} disabled={loading}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2" />
      </label>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm text-white disabled:opacity-60">
        {loading ? 'Sending...' : 'Send verification email'}
      </button>
    </form>
  );
}
