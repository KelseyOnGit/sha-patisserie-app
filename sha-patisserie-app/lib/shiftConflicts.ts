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