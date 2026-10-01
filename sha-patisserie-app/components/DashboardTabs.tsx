'use client';

import { useState } from 'react';
import ClockInCard from '@/components/ClockInCard';
import RosterView from '@/components/RosterView';
import PayslipView from '@/components/PayslipView';
import BottomNav from '@/components/BottomNav';

type TabType = 'clock' | 'roster' | 'payslips' | 'profile';
import StaffProfile from '@/components/StaffProfile';

interface DashboardTabsProps {
  userName?: string;
}

export default function DashboardTabs({ userName }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('clock');

  return (
    <div className="pb-24">
      {/* Active Tab View */}
      <main className="w-full">
        {activeTab === 'clock' && <ClockInCard userName={userName} />}
        {activeTab === 'roster' && <RosterView />}
        {activeTab === 'payslips' && <PayslipView />}
        {activeTab === 'profile' && <StaffProfile />}
      </main>

      {/* Navigation Bar */}
      <BottomNav
        activeTab={activeTab as Parameters<typeof BottomNav>[0]['activeTab']}
        setActiveTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}