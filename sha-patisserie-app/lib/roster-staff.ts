import { currentWeek, perthDate } from '@/lib/timesheets';

type Staff = { id: string; status?: string; location?: { code: string } | null };
type Shift = { userId: string; startTime: Date | string; location?: { code: string } | null };

export function rosterStaff<T extends Staff>(users: T[], shifts: Shift[], weekStart: string, venue: string): T[] {
  const end = new Date(`${weekStart}T00:00:00+08:00`);
  end.setUTCDate(end.getUTCDate() + 7);
  const weekEnd = perthDate(end);
  return users.filter((user) => user.status !== 'INACTIVE' ? user.location?.code === venue :
    weekStart < currentWeek() && shifts.some((shift) => shift.userId === user.id &&
      shift.location?.code === venue && perthDate(shift.startTime) >= weekStart && perthDate(shift.startTime) < weekEnd));
}

export function assignableStaff<T extends Staff>(users: T[], venue: string, editingUserId?: string): T[] {
  return users.filter((user) => user.id === editingUserId ||
    (user.location?.code === venue && user.status !== 'INACTIVE'));
}
