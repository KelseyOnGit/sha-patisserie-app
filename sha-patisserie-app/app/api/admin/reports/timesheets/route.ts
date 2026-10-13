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
    let rawBody: unknown;
    try { rawBody = await req.json(); } catch { throw new ReviewError('Invalid JSON request.'); }
    if (!rawBody || typeof rawBody !== 'object') {
      throw new ReviewError('Missing or invalid request payload.');
    }

    const rawItems: unknown[] = Array.isArray((rawBody as { batch?: unknown }).batch)
      ? (rawBody as { batch: unknown[] }).batch
      : [rawBody];

    if (!rawItems.length) {
      throw new ReviewError('No timesheet items provided.');
    }

    const items = rawItems.map((item) => {
      if (!item || typeof item !== 'object' ||
          !('sourceKey' in item) || typeof item.sourceKey !== 'string' ||
          !('weekStart' in item) || typeof item.weekStart !== 'string' ||
          !('version' in item) || typeof item.version !== 'number' || !Number.isInteger(item.version) || item.version < 0 ||
          !('snapshot' in item) || typeof item.snapshot !== 'string' ||
          !('action' in item) || typeof item.action !== 'string' || !['SAVE', 'APPROVE', 'REOPEN'].includes(item.action) ||
          !('reason' in item) || typeof item.reason !== 'string' ||
          !('periods' in item) || !('breakMinutes' in item) || typeof item.breakMinutes !== 'number') {
        throw new ReviewError('Missing or invalid timesheet fields in request.');
      }
      const reason = item.reason.trim();
      if (reason.length > 2000) throw new ReviewError('Reason must be 2,000 characters or fewer.');
      weekBounds(item.weekStart);
      const periods = readPeriods(item.periods);
      return {
        sourceKey: item.sourceKey,
        weekStart: item.weekStart,
        version: item.version,
        snapshot: item.snapshot,
        action: item.action,
        breakMinutes: item.breakMinutes,
        reason,
        periods,
      };
    });

    const targetWeekStart = items[0].weekStart;

    await prisma.$transaction(async (tx) => {
      const report = await loadTimesheetReport(targetWeekStart, tx);

      for (const item of items) {
        const { sourceKey, version, snapshot, action, breakMinutes, reason } = item;
        let periods = item.periods;

        const row = report.shifts.find((candidate) => candidate.sourceKey === sourceKey);
        if (!row) throw new ReviewError(`Timesheet source ${sourceKey} no longer exists in this week.`, 404);

        if (row.version !== version || row.snapshot !== snapshot) {
          throw new ReviewError(`Timesheet for ${row.staffName} (${row.workDate}) changed. Refresh before saving.`, 409);
        }

        if (action === 'REOPEN') {
          if (row.status !== 'APPROVED') throw new ReviewError('Only approved timesheets can be reopened.');
          if (!reason) throw new ReviewError('Enter a reason for reopening this approval.');
          periods = row.periods;
        } else {
          if (row.status === 'APPROVED' && action === 'APPROVE' && version === row.version) {
            // Already approved with same version, skip re-approving
            continue;
          }
          if (row.status === 'APPROVED') {
            throw new ReviewError(`Reopen the approved timesheet for ${row.staffName} before changing it.`, 409);
          }
          try {
            validatePayable(periods, breakMinutes, row.workDate);
            if (requiresReason(row, periods, breakMinutes) && !reason) {
              throw new Error(`Explain adjustments, missing attendance or unscheduled work for ${row.staffName} (${row.workDate}) before saving.`);
            }
            if (action === 'APPROVE') validateApproval(row, periods);
          } catch (error) {
            throw new ReviewError(error instanceof Error ? error.message : 'Invalid payable values.');
          }
        }

        if (action === 'APPROVE' && periods.length) {
          const others = await tx.timesheet.findMany({
            where: { userId: row.userId, status: 'APPROVED', sourceKey: { not: sourceKey } },
            select: { payablePeriods: true },
          });
          const overlaps = others.some((other) => readPeriods(other.payablePeriods).some((existing) =>
            periods.some((period) => new Date(period.start) < new Date(existing.end) &&
              new Date(period.end) > new Date(existing.start))));
          if (overlaps) {
            throw new ReviewError(`Payable periods for ${row.staffName} overlap another approved timesheet. Reopen or correct the other entry first.`);
          }
        }

        const approved = action === 'APPROVE';
        const data = {
          payablePeriods: periods.map((period) => ({ ...period })),
          breakMinutes: action === 'REOPEN' ? row.breakMinutes : breakMinutes,
          reason,
          status: approved ? ('APPROVED' as const) : ('PENDING' as const),
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
              ...data,
              sourceKey,
              userId: row.userId,
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
          if (update.count !== 1) {
            throw new ReviewError(`Another manager saved timesheet for ${row.staffName}. Refresh before retrying.`, 409);
          }
          id = existing.id;
        }

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
            timesheetId: id,
            actorId: session.userId,
            action: String(action),
            values: {
              ...data,
              approvedAt: data.approvedAt?.toISOString() ?? null,
              hours: paidHours(periods, data.breakMinutes),
              actual: row.actual.map((log) => ({ ...log })),
              sourceSnapshot: row.snapshot,
            },
          },
        });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 25000 });

    const isSingle = items.length === 1;
    const action = items[0].action;
    const message = isSingle
      ? (action === 'APPROVE' ? 'Worked hours approved.' : action === 'REOPEN' ? 'Approval reopened; hours excluded from payroll.' : 'Timesheet changes saved, awaiting approval.')
      : `${items.length} timesheet records successfully processed and approved.`;

    return NextResponse.json({ message, count: items.length });
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
