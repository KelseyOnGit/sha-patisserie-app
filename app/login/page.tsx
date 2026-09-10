'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, pinCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-stone-50 to-stone-100 p-4">
      {/* Decorative ambient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-900/5 transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs tracking-widest text-amber-800 uppercase font-medium bg-amber-50 border border-amber-200/50 rounded-full mb-3">
            Staff Portal
          </span>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight font-normal">
            Sha Patisserie
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sign in with your email and assigned staff PIN
          </p>
        </div>

        {/* Muted Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50/90 border border-rose-200/70 text-rose-700 text-xs rounded-2xl flex items-center gap-3 transition-all">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
            <p className="leading-tight">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="k.wang@shapatisserie.com.au"
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 transition-all duration-200 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* PIN Input */}
          <div>
            <label
              htmlFor="pinCode"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              PIN Code
            </label>
            <input
              id="pinCode"
              name="pinCode"
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              disabled={loading}
              placeholder="••••"
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 transition-all duration-200 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none disabled:opacity-50 tracking-widest"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-stone-300"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-400">
            Protected Staff Terminal &bull; Sha Patisserie App
          </p>
        </div>
      </div>
    </main>
  );
}
