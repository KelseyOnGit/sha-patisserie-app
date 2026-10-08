import { prisma } from '@/lib/prisma';

//Time range overlap check function
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

//Format date in Perth timezone
function formatPerth(date: Date) {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

//Find overlapping shift for a user within a specified time range, optionally excluding a specific shift ID
export function findOverlappingShift(userId: string, start: Date, end: Date, excludeId?: string) {
  return prisma.shift.findFirst({
    where: {
      userId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startTime: { lt: end },
      endTime: { gt: start },
    },
    include: { user: { select: { name: true } } },
  });
}

//Generate a user-friendly message indicating that a shift overlaps with another shift  
export function overlapMessage(shift: { user: { name: string | null } }) {
  return `${shift.user.name ?? 'This staff member'} already has an overlapping shift.`;
}

// Perth has no daylight saving, so a fixed +08:00 offset is safe.
export function perthDayBounds(date: Date) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Perth' }).format(date);
  const start = new Date(`${day}T00:00:00+08:00`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function findShiftOnSameDay(userId: string, date: Date, excludeId?: string) {
  const { start, end } = perthDayBounds(date);
  return prisma.shift.findFirst({
    where: {
      userId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startTime: { gte: start, lt: end },
    },
    include: { user: { select: { name: true } } },
  });
}

export function sameDayMessage(shift: { user: { name: string | null } }) {
  return `${shift.user.name ?? 'This staff member'} already has a shift on that day.`;
}