'use client';

import { useState } from 'react';
import ClockInCard from '@/components/ClockInCard';
import RosterView from '@/components/RosterView';
import PayslipView from '@/components/PayslipView';
import BottomNav from '@/components/BottomNav';

interface DashboardTabsProps {
  userName?: string;
}

export default function DashboardTabs({ userName }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'clock' | 'roster' | 'payslips'>('clock');

  return (
    <div className="pb-24">
      {/* Active Tab View */}
      <main className="w-full">
        {activeTab === 'clock' && <ClockInCard userName={userName} />}
        {activeTab === 'roster' && <RosterView />}
        {activeTab === 'payslips' && <PayslipView />}
      </main>

      {/* Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}