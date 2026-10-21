import { LEAVE_LABELS } from '@/lib/leave';
import type { RosterLeave } from '@/lib/roster-leave';

export default function RosterLeaveCard({ leave }: { leave: RosterLeave }) {
  return (
    <div className="w-full rounded-md border border-emerald-300 bg-emerald-100 p-2 text-emerald-950">
      <span className="block text-xs font-bold">{LEAVE_LABELS[leave.type] ?? leave.type}</span>
    </div>
  );
}
