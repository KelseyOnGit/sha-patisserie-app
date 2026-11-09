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
  const startedAt = Date.now();
  let stage = 'validate request';
  let batchSize = 0;
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
    batchSize = items.length;
    if (items.some((item) => item.weekStart !== targetWeekStart)) {
      throw new ReviewError('All timesheets in a batch must belong to the same week.');
    }
    if (new Set(items.map((item) => item.sourceKey)).size !== items.length) {
      throw new ReviewError('A timesheet can only appear once in a batch.');
    }

    const save = () => prisma.$transaction(async (tx) => {
      stage = 'load report';
      const report = await loadTimesheetReport(targetWeekStart, tx);
      const rowsByKey = new Map(report.shifts.map((row) => [row.sourceKey, row]));
      const newSheets: Prisma.TimesheetCreateManyInput[] = [];
      const updates: (Prisma.TimesheetCreateManyInput & { expectedVersion: number })[] = [];
      const audits: (Omit<Prisma.TimesheetAuditCreateManyInput, 'timesheetId'> & { sourceKey: string })[] = [];
      const allocations: { sourceKey: string; logId: string }[] = [];
      const idsByKey = new Map<string, string>();

      stage = 'validate timesheets';
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

        if (version === 0) {
          const id = randomUUID();
          idsByKey.set(sourceKey, id);
          newSheets.push({
            id,
            ...data,
            sourceKey,
            userId: row.userId,
            shiftId: sourceKey.startsWith('shift:') ? sourceKey.slice(6) : null,
            workDate: new Date(`${row.workDate}T00:00:00Z`),
          });
        } else {
          updates.push({
            ...data, sourceKey, expectedVersion: version,
            userId: row.userId, workDate: new Date(`${row.workDate}T00:00:00Z`),
          });
        }

        allocations.push(...row.actual.map((log) => ({ sourceKey, logId: log.id })));

        audits.push({
          sourceKey,
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
      stage = 'create timesheets';
      if (newSheets.length) await tx.timesheet.createMany({ data: newSheets });
      stage = 'update timesheets';
      if (updates.length) {
        // Prisma cannot assign different values per row in updateMany.
        const updated = await tx.$queryRaw<{ id: string; sourceKey: string }[]>(Prisma.sql`
          UPDATE "Timesheet" AS sheet
          SET "attendanceStatus" = item."attendanceStatus",
              "payablePeriods" = item."payablePeriods",
              "breakMinutes" = item."breakMinutes",
              "reason" = item.reason,
              "status" = item.status::"TimesheetStatus",
              "approvedAt" = item."approvedAt",
              "approvedBy" = item."approvedBy",
              "rateAtApproval" = item."rateAtApproval",
              "sourceSnapshot" = item."sourceSnapshot",
              "site" = item.site,
              "version" = sheet.version + 1,
              "updatedAt" = CURRENT_TIMESTAMP
          FROM jsonb_to_recordset(${JSON.stringify(updates)}::jsonb) AS item(
            "sourceKey" text, "expectedVersion" integer, "attendanceStatus" text,
            "payablePeriods" jsonb, "breakMinutes" integer, reason text, status text,
            "approvedAt" timestamp, "approvedBy" text, "rateAtApproval" numeric,
            "sourceSnapshot" text, site text
          )
          WHERE sheet."sourceKey" = item."sourceKey" AND sheet.version = item."expectedVersion"
          RETURNING sheet.id, sheet."sourceKey"
        `);
        if (updated.length !== updates.length) {
          throw new ReviewError('Another manager changed a timesheet. Refresh and review before retrying.', 409);
        }
        for (const sheet of updated) idsByKey.set(sheet.sourceKey, sheet.id);
      }
      const logAllocations = allocations.map(({ sourceKey, logId }) => {
        const timesheetId = idsByKey.get(sourceKey);
        if (!timesheetId) throw new Error('Saved timesheet ID missing during attendance allocation.');
        return { logId, timesheetId };
      });
      if (new Set(logAllocations.map((entry) => entry.logId)).size !== logAllocations.length) {
        throw new ReviewError('Attendance appears in more than one timesheet. Refresh and review before retrying.', 409);
      }
      if (logAllocations.length) {
        stage = 'allocate attendance';
        const allocated = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`
          UPDATE "TimeLog" AS log
          SET "timesheetId" = item."timesheetId", "updatedAt" = CURRENT_TIMESTAMP
          FROM jsonb_to_recordset(${JSON.stringify(logAllocations)}::jsonb)
            AS item("logId" text, "timesheetId" text)
          WHERE log.id = item."logId"
            AND (log."timesheetId" IS NULL OR log."timesheetId" = item."timesheetId")
          RETURNING log.id
        `);
        if (allocated.length !== logAllocations.length) {
          throw new ReviewError('Attendance was allocated to another timesheet. Refresh before retrying.', 409);
        }
      }
      if (audits.length) {
        stage = 'create audit records';
        await tx.timesheetAudit.createMany({
          data: audits.map(({ sourceKey, ...audit }) => {
            const timesheetId = idsByKey.get(sourceKey);
            if (!timesheetId) throw new Error('Saved timesheet ID missing during audit creation.');
            return { ...audit, timesheetId };
          }),
        });
      }
      stage = 'commit transaction';
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
    console.error('Failed to save timesheet review:', {
      stage, batchSize, elapsedMs: Date.now() - startedAt, error,
    });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2024', 'P2028'].includes(error.code)) {
      return NextResponse.json({ error: 'The database could not complete the save transaction. No changes were committed. Refresh and retry, or approve one staff member at a time.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unable to save timesheet. No changes were committed.' }, { status: 500 });
  }
}
