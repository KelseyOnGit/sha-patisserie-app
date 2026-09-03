'use client';

import { useState, type FormEvent } from 'react'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // 1. Declare state variables properly
  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Pass the FormEvent parameter
  async function handleSubmit(e: FormEvent) {
    // Prevent default browser form submission (reloads)
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, pinCode })
      });

      // Parse JSON payload first
      const data = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        // Use the error message from your API route response
        setErrorMessage(data.error || 'Login failed');
        return;
      }

      // Successful login -> Navigate to clock-in dashboard
      router.push('/dashboard');

    } catch (error) {
      // Network failures (e.g. lost internet connection)
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-800 mb-6 text-center">
          Staff Sign In
        </h1>

        {/* Display backend error messages conditionally */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="e.g. vanessa@shapatisserie.com.au"
              required
              className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none disabled:bg-stone-100"
            />
          </div>

          {/* PIN Code Field */}
          <div>
            <label htmlFor="pinCode" className="block text-sm font-medium text-stone-700 mb-1">
              PIN Code
            </label>
            <input
              id="pinCode"
              name="pinCode"
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              disabled={loading}
              placeholder="Enter your PIN"
              required
              className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none disabled:bg-stone-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-800 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

