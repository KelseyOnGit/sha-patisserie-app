import { createHash, randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { candidateShifts, type MatchLog, type MatchShift } from '@/lib/attendance-matching';
import { notificationConfig, notifyMissedClockIn, notifyMissedClockOut } from '@/lib/admin-notifications';

export const ATTENDANCE_GRACE_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function overdueAttendance(shift: MatchShift, shifts: MatchShift[], logs: MatchLog[], now: Date) {
  const matches = logs.filter((log) => candidateShifts(log, shifts, now).some((candidate) => candidate.id === shift.id));
  const startOverdue = now.getTime() >= shift.startTime.getTime() + ATTENDANCE_GRACE_MS &&
    now.getTime() < shift.endTime.getTime();
  const endOverdue = now.getTime() >= shift.endTime.getTime() + ATTENDANCE_GRACE_MS &&
    now.getTime() <= shift.endTime.getTime() + DAY_MS;
  // An open session continuing into another published shift is not a missed clock-out.
  const continuingShift = shifts.some((other) => other.id !== shift.id && other.userId === shift.userId &&
    other.startTime <= now && other.endTime > now);
  return {
    clockIn: startOverdue && matches.length === 0,
    clockOut: endOverdue && !continuingShift && matches.some((log) => log.clockOut === null),
  };
}

export async function checkAttendanceNotifications(now = new Date()) {
  const { recipients } = notificationConfig();
  const shifts = await prisma.shift.findMany({
    where: {
      publishedAt: { not: null },
      user: { status: 'ACTIVE', isApproved: true },
      startTime: { lte: now },
      endTime: { gte: new Date(now.getTime() - DAY_MS) },
    },
    include: { user: { select: { name: true } } },
  });
  if (!shifts.length) return { sent: 0, failed: 0 };
  const logs = await prisma.timeLog.findMany({
    where: {
      userId: { in: [...new Set(shifts.map((shift) => shift.userId))] },
      clockIn: { lte: now },
      OR: [{ clockOut: null }, { clockOut: { gte: new Date(Math.min(...shifts.map((shift) => shift.startTime.getTime()))) } }],
    },
  });
  const counts = { sent: 0, failed: 0 };
  for (const shift of shifts) {
    const overdue = overdueAttendance(shift, shifts, logs, now);
    for (const event of ['clockIn', 'clockOut'] as const) {
      if (!overdue[event]) continue;
      for (const recipient of recipients) {
        const boundary = event === 'clockIn' ? shift.startTime : shift.endTime;
        const id = createHash('sha256').update(`${shift.id}|${event}|${boundary.toISOString()}|${recipient}`).digest('hex');
        const claimToken = randomUUID();
        const alert = await prisma.attendanceNotification.upsert({ where: { id }, create: { id, createdAt: now }, update: {} });
        const claimed = await prisma.attendanceNotification.updateMany({
          where: { id, sentAt: null, OR: [{ claimUntil: null }, { claimUntil: { lte: now } }] },
          data: { claimToken, claimUntil: new Date(now.getTime() + 5 * 60 * 1000) },
        });
        if (!claimed.count) continue;
        const delivery = { recipient, idempotencyKey: `attendance-${id}` };
        const result = event === 'clockIn'
          ? await notifyMissedClockIn({ userId: shift.userId, name: shift.user.name,
            scheduledStart: shift.startTime, minutesLate: Math.floor((alert.createdAt.getTime() - shift.startTime.getTime()) / 60000) }, delivery)
          : await notifyMissedClockOut({ userId: shift.userId, name: shift.user.name,
            scheduledEnd: shift.endTime }, delivery);
        await prisma.attendanceNotification.updateMany({
          where: { id, claimToken },
          data: { sentAt: result.sent ? new Date() : null, claimToken: null, claimUntil: null },
        });
        if (result.sent) counts.sent++;
        else counts.failed++;
      }
    }
  }
  return counts;
}
