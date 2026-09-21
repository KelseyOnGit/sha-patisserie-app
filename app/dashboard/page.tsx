import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // 1. Fetch the user's session from the HTTP-only cookie
  const session = await getSession();

  // 2. Fallback check (Middleware also protects this route)
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100 via-stone-50 to-stone-100 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
          <div>
            <span className="inline-block px-3 py-1 text-xs tracking-widest text-amber-800 uppercase font-medium bg-amber-50 border border-amber-200/50 rounded-full mb-2">
              Staff Portal
            </span>
            <h1 className="text-3xl font-serif text-stone-800 tracking-tight font-normal">
              Welcome back, {session.email.split('@')[0]}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Signed in as <span className="font-medium text-stone-700">{session.email}</span>
            </p>
          </div>

          {/* Logout Action Placeholder */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-stone-200/60 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-all"
            >
              Sign Out
            </button>
          </form>
        </header>

        {/* Shift / Clock-In Card Placeholder */}
        <section className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-900/5">
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl font-serif">
              ⏱
            </div>
            <h2 className="text-xl font-serif text-stone-800">Ready for your shift?</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Clock-in feature and shift management will be connected here next.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}