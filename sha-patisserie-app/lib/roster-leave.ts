export interface RosterLeave {
  id: string;
  userId: string;
  workDate: string;
  type: string;
  status: string;
  hours: number | string;
}

export async function fetchRosterLeave(weekStart: string): Promise<RosterLeave[]> {
  const response = await fetch(`/api/leave?view=roster&weekStart=${encodeURIComponent(weekStart)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load roster leave.');
  if (!Array.isArray(data.requests)) throw new Error('Invalid roster leave response.');
  // Approved leave remains in effect while its cancellation awaits review.
  return data.requests.filter((entry: RosterLeave) =>
    isEffectiveLeave(entry.status)
  );
}
import { isEffectiveLeave } from '@/lib/leave';
