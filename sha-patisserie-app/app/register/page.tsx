'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, contactNumber, pinCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Registration failed');
        return;
      }

      setSuccessMessage(data.message || 'Check your email to verify your address. Admin approval follows verification.');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-stone-50 to-stone-100 p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-900/5">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs tracking-widest text-amber-800 uppercase font-medium bg-amber-50 border border-amber-200/50 rounded-full mb-3">
            Staff Onboarding
          </span>
          <h1 className="text-3xl font-serif text-stone-800 tracking-tight font-normal">
            Create Staff Account
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Register, verify your email, then wait for admin approval
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50/90 border border-rose-200/70 text-rose-700 text-xs rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <p className="leading-tight">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50/90 border border-emerald-200/70 text-emerald-700 text-xs rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="leading-tight">{successMessage}</p>
          </div>
        )}

        {!successMessage && <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Please enter your name here"
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contactNumber"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              Contact Number (Optional)
            </label>
            <input
              id="contactNumber"
              type="tel"
              autoComplete="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={loading}
              placeholder="0412 345 678"
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="please enter your email address here"
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="pinCode"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
            >
              PIN Code
            </label>
            <input
              id="pinCode"
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              disabled={loading}
              placeholder="••••"
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 text-sm placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-100 focus:outline-none tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>}

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <Link href="/verify-email" className="mb-4 block text-xs font-semibold text-stone-800 hover:underline">
            Resend verification email
          </Link>
          <p className="text-xs text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-stone-800 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
