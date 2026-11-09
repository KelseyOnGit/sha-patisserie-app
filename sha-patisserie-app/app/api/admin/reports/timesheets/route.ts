import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { loadTimesheetReport, validateApproval } from '@/lib/timesheet-report';
import { actualPeriods, paidHours, readPeriods, requiresReason, samePeriods, validatePayable, weekBounds } from '@/lib/timesheets';
import { ATTENDANCE_OPTIONS } from '@/lib/timesheets';

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
      const attendanceStatus = 'attendanceStatus' in item ? item.attendanceStatus : undefined;
      if (attendanceStatus !== undefined && !ATTENDANCE_OPTIONS.some(([value]) => value === attendanceStatus)) {
        throw new ReviewError('Choose a valid attendance classification.');
      }
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
        attendanceStatus: attendanceStatus as string | undefined,
      };
    });

    const targetWeekStart = items[0].weekStart;
    if (items.some((item) => item.weekStart !== targetWeekStart)) {
      throw new ReviewError('All timesheets in a batch must belong to the same week.');
    }
    if (new Set(items.map((item) => item.sourceKey)).size !== items.length) {
      throw new ReviewError('A timesheet can only appear once in a batch.');
    }

    const save = () => prisma.$transaction(async (tx) => {
      const report = await loadTimesheetReport(targetWeekStart, tx);
      const rowsByKey = new Map(report.shifts.map((row) => [row.sourceKey, row]));
      const newSheets: Prisma.TimesheetCreateManyInput[] = [];
      const audits: Prisma.TimesheetAuditCreateManyInput[] = [];
      const allocations: { id: string; logIds: string[] }[] = [];

      for (const item of items) {
        const { sourceKey, version, snapshot, action, breakMinutes, reason } = item;
        let periods = item.periods;

        const row = rowsByKey.get(sourceKey);
        if (!row) throw new ReviewError(`Timesheet source ${sourceKey} no longer exists in this week.`, 404);

        if (row.version !== version || row.snapshot !== snapshot) {
          throw new ReviewError(`Timesheet for ${row.staffName} (${row.workDate}) changed. Refresh before saving.`, 409);
        }

        let finalReason = reason;
        const attendanceStatus = item.attendanceStatus ?? row.attendanceStatus ?? 'UNCLASSIFIED';
        if (action !== 'REOPEN' && attendanceStatus === 'NO_SHOW' && periods.length > 0) {
          throw new ReviewError('No show cannot have payable worked periods. Review the actual attendance first.');
        }
        if (action === 'REOPEN') {
          if (row.status !== 'APPROVED') throw new ReviewError('Only approved timesheets can be reopened.');
          if (!reason) throw new ReviewError('Enter a reason for reopening this approval.');
          periods = row.periods;
        } else {
          if (row.status === 'APPROVED' && action === 'APPROVE' &&
              !row.sourceChanged &&
              samePeriods(periods, row.periods) && breakMinutes === row.breakMinutes &&
              attendanceStatus === (row.attendanceStatus ?? 'UNCLASSIFIED')) {
            // Unchanged approved row: keep the original approver and timestamp
            continue;
          }
          try {
            validatePayable(periods, breakMinutes, row.workDate);
            const isOnlyBreakChange = samePeriods(periods, actualPeriods(row.actual)) &&
              row.actual.length > 0 && !row.ambiguous && !row.inProgress;
            if (!finalReason && isOnlyBreakChange) {
              finalReason = 'Break adjusted';
            }
            if (requiresReason(row, periods, breakMinutes) && !finalReason) {
              finalReason = 'Hours adjusted by manager';
            }
            if (action === 'APPROVE') validateApproval(row, periods);
          } catch (error) {
            throw new ReviewError(`${row.staffName} (${row.workDate}): ${error instanceof Error ? error.message : 'Invalid payable values.'}`);
          }
        }


        const approved = action === 'APPROVE';
        const data = {
          attendanceStatus: action === 'REOPEN' ? row.attendanceStatus : attendanceStatus,
          payablePeriods: periods.map((period) => ({ ...period })),
          breakMinutes: action === 'REOPEN' ? row.breakMinutes : breakMinutes,
          reason: finalReason,
          status: approved ? ('APPROVED' as const) : ('PENDING' as const),
          approvedAt: approved ? new Date() : null,
          approvedBy: approved ? session.userId : null,
          rateAtApproval: approved ? row.rate : null,
          sourceSnapshot: row.snapshot,
          site: row.site,
        };

        let id: string;
        if (version === 0) {
          id = randomUUID();
          newSheets.push({
            id,
            ...data,
            sourceKey,
            userId: row.userId,
            shiftId: sourceKey.startsWith('shift:') ? sourceKey.slice(6) : null,
            workDate: new Date(`${row.workDate}T00:00:00Z`),
          });
        } else {
          const sheet = await tx.timesheet.update({
            where: { sourceKey, version },
            data: { ...data, version: { increment: 1 } },
            select: { id: true },
          });
          id = sheet.id;
        }

        const ids = row.actual.map((log) => log.id);
        if (ids.length) allocations.push({ id, logIds: ids });

        audits.push({
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
        });
      }
      if (newSheets.length) await tx.timesheet.createMany({ data: newSheets });
      for (const { id, logIds } of allocations) {
        const allocated = await tx.timeLog.updateMany({
          where: { id: { in: logIds }, OR: [{ timesheetId: null }, { timesheetId: id }] },
          data: { timesheetId: id },
        });
        if (allocated.count !== logIds.length) {
          throw new ReviewError('Attendance was allocated to another timesheet. Refresh before retrying.', 409);
        }
      }
      if (audits.length) await tx.timesheetAudit.createMany({ data: audits });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 25000 });

    for (let attempt = 0; ; attempt++) {
      try {
        await save();
        break;
      } catch (error) {
        // A serialization failure rolls back everything; re-read before retrying.
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) ||
            error.code !== 'P2034' || attempt >= 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2025', 'P2034'].includes(error.code)) {
      console.error('Timesheet save conflict:', error);
      return NextResponse.json({ error: 'A concurrent update occurred. Refresh and review before retrying.' }, { status: 409 });
    }
    console.error('Failed to save timesheet review:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2024', 'P2028'].includes(error.code)) {
      return NextResponse.json({ error: 'The database could not complete the save transaction. No changes were committed. Refresh and retry, or approve one staff member at a time.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unable to save timesheet. No changes were committed.' }, { status: 500 });
  }
}
