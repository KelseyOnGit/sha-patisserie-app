'use client';

import { useState } from 'react';
import ClockInCard from '@/components/ClockInCard';
import RosterView from '@/components/RosterView';
// import PayslipView from '@/components/PayslipView'; // Hidden pending MYOB integration.
import BottomNav from '@/components/BottomNav';
import LeavePanel from '@/components/LeavePanel';

type TabType = 'clock' | 'roster' | 'payslips' | 'profile' | 'leave';
import StaffProfile from '@/components/StaffProfile';

interface DashboardTabsProps {
  userName?: string;
}

export default function DashboardTabs({ userName }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('clock');

  return (
    <div className="w-full min-w-0 pb-24">
      {/* Active Tab View */}
      <main className="w-full">
        {activeTab === 'clock' && <ClockInCard userName={userName} />}
        {activeTab === 'roster' && <RosterView />}
        {/* {activeTab === 'payslips' && <PayslipView />} */}
        {activeTab === 'profile' && <StaffProfile />}
        {activeTab === 'leave' && <LeavePanel />}
      </main>

      {/* Navigation Bar */}
      <BottomNav
        activeTab={activeTab as Parameters<typeof BottomNav>[0]['activeTab']}
        setActiveTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}