'use client';

type TabType = 'clock' | 'roster' | 'payslips' | 'leave';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'clock', label: 'Clock In', icon: '⏱️' },
    { id: 'roster', label: 'Roster', icon: '📅' },
    // { id: 'payslips', label: 'Payslips', icon: '📄' }, // Hidden pending MYOB integration.
    { id: 'leave', label: 'Leave', icon: '📅' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 px-6 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-amber-800 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-amber-600 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}