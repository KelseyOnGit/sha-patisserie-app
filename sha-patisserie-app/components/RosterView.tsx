'use client';

export default function RosterView() {
  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-serif font-bold text-stone-800 mb-4">
        Weekly Roster
      </h2>
      <div className="space-y-3">
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Today</p>
            <p className="text-sm font-semibold text-stone-800">Sha Patisserie</p>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            6:30 AM - 2:30 PM
          </span>
        </div>
        <p className="text-center text-xs text-stone-400 pt-2">
          Full weekly roster syncing coming soon.
        </p>
      </div>
    </div>
  );
}