import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { loadTimesheetReport, validateApproval } from '@/lib/timesheet-report';
import { paidHours, readPeriods, requiresReason, validatePayable, weekBounds } from '@/lib/timesheets';

class ReviewError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    let body: unknown;
    try { body = await req.json(); } catch { throw new ReviewError('Invalid JSON request.'); }
    if (!body || typeof body !== 'object' ||
        !('sourceKey' in body) || typeof body.sourceKey !== 'string' ||
        !('weekStart' in body) || typeof body.weekStart !== 'string' ||
        !('version' in body) || typeof body.version !== 'number' || !Number.isInteger(body.version) || body.version < 0 ||
        !('snapshot' in body) || typeof body.snapshot !== 'string' ||
        !('action' in body) || typeof body.action !== 'string' || !['SAVE', 'APPROVE', 'REOPEN'].includes(body.action) ||
        !('reason' in body) || typeof body.reason !== 'string' ||
        !('periods' in body) || !('breakMinutes' in body) || typeof body.breakMinutes !== 'number') {
      throw new ReviewError('Missing or invalid timesheet fields.');
    }
    const { sourceKey, weekStart, version, snapshot, action, breakMinutes } = body;
    const reason = body.reason.trim();
    if (reason.length > 2000) throw new ReviewError('Reason must be 2,000 characters or fewer.');
    let periods: ReturnType<typeof readPeriods>;
    try {
      weekBounds(weekStart);
      periods = readPeriods(body.periods);
    } catch (error) {
      throw new ReviewError(error instanceof Error ? error.message : 'Invalid payable values.');
    }

    await prisma.$transaction(async (tx) => {
      const report = await loadTimesheetReport(weekStart, tx);
      const row = report.shifts.find((candidate) => candidate.sourceKey === sourceKey);
      if (!row) throw new ReviewError('Timesheet source no longer exists in this week.', 404);
      // Version protects manager-vs-manager edits; snapshot also protects against
      // staff clock/break updates since the manager loaded the screen.
      if (row.version !== version || row.snapshot !== snapshot) {
        throw new ReviewError('This timesheet changed. Refresh and review the latest values before saving.', 409);
      }
      if (action === 'REOPEN') {
        if (row.status !== 'APPROVED') throw new ReviewError('Only approved timesheets can be reopened.');
        if (!reason) throw new ReviewError('Enter a reason for reopening this approval.');
        periods = row.periods;
      } else {
        if (row.status === 'APPROVED') throw new ReviewError('Reopen the approved timesheet before changing it.', 409);
        try {
          validatePayable(periods, breakMinutes, row.workDate);
          if (requiresReason(row, periods, breakMinutes) && !reason) {
            throw new Error('Explain adjustments, missing attendance or unscheduled work before saving.');
          }
          if (action === 'APPROVE') validateApproval(row, periods);
        } catch (error) {
          throw new ReviewError(error instanceof Error ? error.message : 'Invalid payable values.');
        }
      }
      if (action === 'APPROVE' && periods.length) {
        // Manual entries and unscheduled work must not pay the same person twice
        // for an overlapping period, even when the other review belongs to a
        // different week or venue. Serializable isolation covers concurrent approvals.
        const others = await tx.timesheet.findMany({
          where: { userId: row.userId, status: 'APPROVED', sourceKey: { not: sourceKey } },
          select: { payablePeriods: true },
        });
        const overlaps = others.some((other) => readPeriods(other.payablePeriods).some((existing) =>
          periods.some((period) => new Date(period.start) < new Date(existing.end) &&
            new Date(period.end) > new Date(existing.start))));
        if (overlaps) throw new ReviewError('These payable periods overlap another approved timesheet for this staff member. Reopen or correct the other entry first.');
      }
      // Empty periods explicitly mean zero payable hours (e.g. a verified absence),
      // not the scheduled duration. Approval with missing attendance needs a reason.
      const approved = action === 'APPROVE';
      const data = {
        payablePeriods: periods.map((period) => ({ ...period })),
        breakMinutes: action === 'REOPEN' ? row.breakMinutes : breakMinutes,
        reason, status: approved ? 'APPROVED' as const : 'PENDING' as const,
        approvedAt: approved ? new Date() : null,
        approvedBy: approved ? session.userId : null,
        rateAtApproval: approved ? row.rate : null,
        sourceSnapshot: row.snapshot,
        site: row.site,
      };
      let id: string;
      if (version === 0) {
        const sheet = await tx.timesheet.create({
          data: {
            ...data, sourceKey, userId: row.userId,
            shiftId: sourceKey.startsWith('shift:') ? sourceKey.slice(6) : null,
            workDate: new Date(`${row.workDate}T00:00:00Z`),
          },
        });
        id = sheet.id;
      } else {
        const existing = await tx.timesheet.findUniqueOrThrow({ where: { sourceKey } });
        const update = await tx.timesheet.updateMany({
          where: { id: existing.id, version },
          data: { ...data, version: { increment: 1 } },
        });
        if (update.count !== 1) throw new ReviewError('Another manager saved this timesheet. Refresh before retrying.', 409);
        id = existing.id;
      }
      // Allocation is durable and exclusive: one TimeLog can only feed one
      // timesheet. Keep all original clock-in/out and GPS fields unchanged.
      const ids = row.actual.map((log) => log.id);
      if (ids.length) {
        const allocated = await tx.timeLog.updateMany({
          where: { id: { in: ids }, OR: [{ timesheetId: null }, { timesheetId: id }] },
          data: { timesheetId: id },
        });
        if (allocated.count !== ids.length) {
          throw new ReviewError('Attendance was allocated to another timesheet. Refresh before retrying.', 409);
        }
      }
      await tx.timesheetAudit.create({
        data: {
          timesheetId: id, actorId: session.userId, action: String(action),
          values: {
            ...data, approvedAt: data.approvedAt?.toISOString() ?? null,
            hours: paidHours(periods, data.breakMinutes), actual: row.actual.map((log) => ({ ...log })),
            sourceSnapshot: row.snapshot,
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 20000 });
    return NextResponse.json({ message: action === 'APPROVE' ? 'Worked hours approved.' : action === 'REOPEN' ? 'Approval reopened; hours excluded from payroll.' : 'Timesheet changes saved, awaiting approval.' });
  } catch (error) {
    if (error instanceof ReviewError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) {
      return NextResponse.json({ error: 'A concurrent update occurred. Refresh and review before retrying.' }, { status: 409 });
    }
    console.error('Failed to save timesheet review:', error);
    return NextResponse.json({ error: 'Unable to save timesheet. No changes were committed.' }, { status: 500 });
  }
}
