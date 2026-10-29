import type { Prisma } from '@prisma/client';

export async function activeAttendanceBreak(db: Prisma.TransactionClient, userId: string, now = new Date()) {
  const log = await db.timeLog.findFirst({
    where: { userId, clockOut: null, clockIn: { gte: new Date(now.getTime() - 16 * 3600000) } },
    orderBy: { clockIn: 'desc' },
  });
  if (!log) return null;

  // Existing shift-based breaks remain finishable after deployment. Only use
  // legacy timestamps belonging to this attendance session, never a prior punch.
  const shifts = await db.shift.findMany({
    where: { userId, startTime: { lt: now }, endTime: { gt: log.clockIn } },
    orderBy: { startTime: 'desc' },
  });
  const legacy = !log.startBreak ? shifts.filter((shift) =>
    shift.startBreak && shift.startBreak >= log.clockIn && shift.startBreak <= now) : [];
  if (legacy.length > 1) throw new Error('Multiple roster breaks match this session. Ask a manager to resolve the overlap.');
  const legacyShift = legacy[0] ?? null;
  return {
    log, legacyShift,
    session: {
      id: log.id,
      startBreak: log.startBreak ?? legacyShift?.startBreak ?? null,
      endBreak: log.startBreak ? log.endBreak : legacyShift?.endBreak ?? null,
      presetBreakMinutes: shifts.length === 1 ? shifts[0].presetBreakMinutes : 30,
    },
  };
}
