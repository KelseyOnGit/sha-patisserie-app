import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { candidateShifts } from '@/lib/attendance-matching';
import {
  actualPeriods, approvalError, paidHours, perthDate, readPeriods, recordedBreakMinutes, weekBounds,
  type PayrollRow, type ReviewRow,
} from '@/lib/timesheets';

const reportUserSelect = {
  id: true, name: true, email: true, status: true, employmentType: true, hourlyPayRate: true,
} satisfies Prisma.UserSelect;
const reportLocationSelect = { name: true } satisfies Prisma.LocationSelect;
const reportShiftSelect = {
  id: true, userId: true, locationId: true, startTime: true, endTime: true,
  startBreak: true, endBreak: true, breakMinutes: true, publishedAt: true,
  user: { select: reportUserSelect }, location: { select: reportLocationSelect },
} satisfies Prisma.ShiftSelect;
const reportLogSelect = {
  id: true, userId: true, locationId: true, clockIn: true, clockOut: true, timesheetId: true,
  startBreak: true, endBreak: true,
  user: { select: reportUserSelect }, location: { select: reportLocationSelect },
} satisfies Prisma.TimeLogSelect;

// The same read model drives GET, transactional saves and payroll. Re-reading it
// inside the save transaction prevents approving stale browser attendance.
export async function loadTimesheetReport(weekStart: string, db: Prisma.TransactionClient = prisma) {
  const { start, end } = weekBounds(weekStart);
  const dateStart = new Date(`${weekStart}T00:00:00Z`);
  const dateEnd = new Date(dateStart.getTime() + 7 * 86400000);
  const now = new Date();
  const [approvedLeave, saved, logs, allLocations] = await Promise.all([
    db.leaveRequest.findMany({
      where: { status: 'APPROVED', workDate: { gte: dateStart, lt: dateEnd } },
      include: { user: { select: { name: true, employmentType: true, location: { select: { name: true } } } } },
      orderBy: { workDate: 'asc' },
    }),
    db.timesheet.findMany({
      where: { workDate: { gte: dateStart, lt: dateEnd } },
      include: {
        user: { select: reportUserSelect },
        shift: { select: reportShiftSelect },
        logs: { select: reportLogSelect, orderBy: { clockIn: 'asc' } },
        history: { include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } },
      },
    }),
    db.timeLog.findMany({
      where: {
        // Include overnight logs crossing the week boundary; the row still belongs
        // to the Perth date its shift (or unscheduled attendance) started.
        clockIn: { lt: end },
        OR: [{ clockOut: { gt: start } }, { clockOut: null }, { clockIn: { gte: start } }],
      },
      select: reportLogSelect,
      orderBy: { clockIn: 'asc' },
    }),
    db.location.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
  ]);
  const earliest = logs.reduce((date, log) => log.clockIn < date ? log.clockIn : date, start);
  const latest = logs.reduce((date, log) => (log.clockOut ?? now) > date ? (log.clockOut ?? now) : date, end);
  const fetchedShifts = await db.shift.findMany({
    where: {
      publishedAt: { not: null },
      startTime: { lt: latest },
      endTime: { gt: earliest },
    },
    select: reportShiftSelect,
    orderBy: { startTime: 'asc' },
  });
  // Saved reviews remain visible even if their roster shift was unpublished.
  const shifts = Array.from(new Map([
    ...fetchedShifts.map((shift) => [shift.id, shift] as const),
    ...saved.flatMap((sheet) => sheet.shift ? [[sheet.shift.id, sheet.shift] as const] : []),
  ]).values());
  const savedByKey = new Map(saved.map((sheet) => [sheet.sourceKey, sheet]));
  const savedById = new Map(saved.map((sheet) => [sheet.id, sheet]));
  const allLogs = Array.from(new Map([
    ...logs.map((log) => [log.id, log] as const),
    ...saved.flatMap((sheet) => sheet.logs.map((log) => [log.id, log] as const)),
  ]).values()).sort((a, b) => a.clockIn.getTime() - b.clockIn.getTime());
  const grouped = new Map<string, typeof allLogs>();
  const ambiguousLogs = new Set<string>();
  const ambiguousShifts = new Set<string>();
  const shiftsByUser = new Map<string, typeof shifts>();
  for (const shift of shifts) {
    if (!shift.publishedAt) continue;
    const userShifts = shiftsByUser.get(shift.userId) ?? [];
    userShifts.push(shift);
    shiftsByUser.set(shift.userId, userShifts);
  }

  for (const log of allLogs) {
    const existing = log.timesheetId ? savedById.get(log.timesheetId) : undefined;
    // A record already allocated to another week's timesheet cannot be paid twice.
    if (log.timesheetId && !existing) continue;
    const matches = candidateShifts(log, shiftsByUser.get(log.userId) ?? [], now);
    let key: string;
    if (existing) {
      key = existing.sourceKey;
    } else if (matches.length === 1) {
      key = `shift:${matches[0].id}`;
    } else {
      key = `log:${log.id}`;
    }
    if (matches.length > 1) {
      ambiguousLogs.add(log.id);
      matches.forEach((shift) => ambiguousShifts.add(shift.id));
    }
    grouped.set(key, [...(grouped.get(key) ?? []), log]);
  }

  const rows: ReviewRow[] = [];
  const inactiveUserIds = new Set<string>();
  const makeRow = (key: string, shift: typeof shifts[number] | null, attendance: typeof allLogs) => {
    const sheet = savedByKey.get(key);
    const user = sheet?.user ?? shift?.user ?? attendance[0]?.user;
    if (!user) throw new Error('Timesheet has no staff member.');
    const origin = shift?.startTime ?? attendance[0]?.clockIn;
    const workDate = sheet ? sheet.workDate.toISOString().slice(0, 10) : origin ? perthDate(origin) : '';
    if (!workDate || workDate < weekStart || workDate >= dateEnd.toISOString().slice(0, 10)) return;
        // Staff who have left keep all recorded or approved hours, but an empty
    // scheduled shift for them is not worth reviewing.
    if (user.status === 'INACTIVE' && !sheet && attendance.length === 0) return;
    if (user.status === 'INACTIVE') inactiveUserIds.add(user.id);
    const actual = attendance.map((log) => ({
      id: log.id, clockIn: log.clockIn.toISOString(), clockOut: log.clockOut?.toISOString() ?? null,
    }));
    const sourceSite = shift?.location?.name ?? attendance[0]?.location?.name ?? sheet?.site ?? 'Unassigned';
    const site = sheet?.site ?? sourceSite;
    // Shift.breakMinutes also stores the roster's preset deduction, and the
    // legacy break handler adds elapsed minutes to it. It is not reliable proof
    // of an actual break. Derive recorded duration from the raw break timestamps.
    const sessionBreaks = attendance.filter((log) => log.startBreak || log.endBreak).map((log) => ({
      id: log.id, startBreak: log.startBreak?.toISOString() ?? null, endBreak: log.endBreak?.toISOString() ?? null,
    }));
    const completedBreaks = [
      recordedBreakMinutes(shift?.startBreak ?? null, shift?.endBreak ?? null),
      ...attendance.map((log) => recordedBreakMinutes(log.startBreak ?? null, log.endBreak ?? null)),
    ].filter((minutes): minutes is number => minutes !== null);
    const actualBreakMinutes = completedBreaks.length ? completedBreaks.reduce((sum, minutes) => sum + minutes, 0) : null;
    const scheduledBreakMinutes = shift?.breakMinutes ?? 0;
    const ambiguous = attendance.some((log) => ambiguousLogs.has(log.id)) ||
      Boolean(shift && ambiguousShifts.has(shift.id));
    // Canonical source values capture changes relevant to pay, not unrelated GPS
    // metadata. Historical approved values remain in the append-only audit log.
    const snapshot = JSON.stringify({
      userId: shift?.userId ?? user.id, site: sourceSite,
      scheduledStart: shift?.startTime.toISOString() ?? null,
      scheduledEnd: shift?.endTime.toISOString() ?? null,
      published: Boolean(shift?.publishedAt),
      actual, breakMinutes: actualBreakMinutes, scheduledBreakMinutes,
      startBreak: shift?.startBreak?.toISOString() ?? null,
      endBreak: shift?.endBreak?.toISOString() ?? null,
      ...(ambiguous ? { rosterOverlap: true } : {}),
      ...(sessionBreaks.length ? { sessionBreaks } : {}),
    });
    const sourceChanged = Boolean(sheet && sheet.sourceSnapshot !== snapshot);
    const inProgress = actual.some((log) => !log.clockOut) || Boolean(shift?.startBreak && !shift.endBreak) ||
      attendance.some((log) => log.startBreak && !log.endBreak);
    const exceptions: string[] = [];
    const rosterIdentityChanged = Boolean(sheet && shift && (
      shift.userId !== sheet.userId || perthDate(shift.startTime) !== workDate || sourceSite !== sheet.site
    ));
    const approvalBlockedReason = rosterIdentityChanged ?
      'Reviewed roster staff, venue or date changed. Restore the original roster identity before approving.' :
      shift && !shift.publishedAt ? 'Publish the roster shift before approving its hours.' : null;
    if (!shift) exceptions.push('Unscheduled attendance');
    if (ambiguous) exceptions.push('Attendance overlaps roster shifts: review payable periods and explain the allocation');
    if (shift && !shift.publishedAt) exceptions.push('Roster shift unpublished');
    if (actual.length === 0) exceptions.push('No attendance recorded');
    if (inProgress) exceptions.push('Clock-out or break unfinished');
    if (sourceChanged) exceptions.push('Source changed: reopen and review');
    if (rosterIdentityChanged) exceptions.push('Reviewed roster identity changed');
    if (actual.length > 1) exceptions.push('Multiple attendance periods');
    if (actualBreakMinutes === null && scheduledBreakMinutes > 0 && actual.length > 0) {
      exceptions.push('Break not recorded: verify the preset deduction');
    }
    if (shift && actual[0] && new Date(actual[0].clockIn) > shift.startTime) {
      exceptions.push(`Arrived ${Math.ceil((new Date(actual[0].clockIn).getTime() - shift.startTime.getTime()) / 60000)} min after scheduled start`);
    }
    const periods = sheet ? readPeriods(sheet.payablePeriods) : actualPeriods(actual);
    rows.push({
      sourceKey: key, userId: user.id, staffName: user.name || user.email, site, workDate,
      employmentType: user.employmentType,
      attendanceStatus: sheet?.attendanceStatus ?? 'UNCLASSIFIED',
      scheduledStart: shift?.startTime.toISOString() ?? null,
      scheduledEnd: shift?.endTime.toISOString() ?? null,
      actual, actualBreakMinutes, scheduledBreakMinutes, periods,
      recordedBreaks: [
        ...(shift?.startBreak ? [{ start: shift.startBreak.toISOString(), end: shift.endBreak?.toISOString() ?? null }] : []),
        ...sessionBreaks.flatMap((entry) => entry.startBreak ? [{ start: entry.startBreak, end: entry.endBreak }] : []),
      ],
      breakMinutes: sheet?.breakMinutes ?? (periods.length ? actualBreakMinutes ?? scheduledBreakMinutes : 0),
      reason: sheet?.reason ?? '', status: sheet?.status ?? 'PENDING',
      needsAttention: exceptions.length > 0,
      exceptions, inProgress, ambiguous, approvalBlockedReason, sourceChanged, snapshot,
      version: sheet?.version ?? 0,
      rate: user.hourlyPayRate?.toNumber() ?? null,
      approvedAt: sheet?.approvedAt?.toISOString() ?? null,
      approvedBy: sheet?.history.find((entry) => entry.action === 'APPROVE')?.actor.name ??
        sheet?.history.find((entry) => entry.action === 'APPROVE')?.actor.email ?? null,
      history: sheet?.history.map((entry) => ({
        action: entry.action, actor: entry.actor.name || entry.actor.email,
        at: entry.createdAt.toISOString(), values: entry.values,
      })) ?? [],
    });
  };

  for (const shift of shifts) {
    const attendance = grouped.get(`shift:${shift.id}`) ?? [];
    makeRow(`shift:${shift.id}`, shift, attendance);
  }
  for (const [key, attendance] of grouped) if (key.startsWith('log:')) makeRow(key, null, attendance);
  rows.sort((a, b) => a.workDate.localeCompare(b.workDate) || a.staffName.localeCompare(b.staffName));

  const summary = new Map<string, PayrollRow>();
  let excludedCount = 0;
  for (const row of rows) {
    const sheet = savedByKey.get(row.sourceKey);
    // Use the same eligibility rules as approval, retaining the approved rate.
    if (!sheet || sheet.status !== 'APPROVED' || row.sourceChanged ||
        sheet.rateAtApproval === null ||
        approvalError({ ...row, rate: sheet.rateAtApproval.toNumber() }, row.periods)) {
      excludedCount++;
      continue;
    }
    const rate = sheet.rateAtApproval.toNumber();
    const key = JSON.stringify([row.userId, sheet.site, rate]);
    const payroll = summary.get(key) ?? {
      key, userId: row.userId, staffName: row.staffName, site: sheet.site,
      employmentType: row.employmentType,
      rate, totalHours: 0, gross: 0,
    };
    payroll.totalHours += paidHours(row.periods, row.breakMinutes);
    payroll.gross = payroll.totalHours * rate;
    summary.set(key, payroll);
  }

  const venues = Array.from(new Set([
    ...allLocations.map((loc) => loc.name),
    ...shifts.map((s) => s.location?.name).filter(Boolean) as string[],
    ...rows.map((r) => r.site).filter(Boolean),
  ])).sort();

  return {
    shifts: rows, rows: Array.from(summary.values()), excludedCount,
    approvedCount: rows.length - excludedCount,
    leaveRows: approvedLeave.map((entry) => ({
      id: entry.id, userId: entry.userId, staffName: entry.user.name || 'Unnamed staff',
      employmentType: entry.user.employmentType, site: entry.user.location?.name || 'Unassigned',
      date: entry.workDate.toISOString().slice(0, 10), type: entry.type, hours: entry.hours.toNumber(),
    })),
    venues, inactiveUserIds: Array.from(inactiveUserIds),
  };
}

export function validateApproval(row: ReviewRow, periods: Parameters<typeof approvalError>[1]) {
  const error = approvalError(row, periods);
  if (error) throw new Error(error);
  if (row.exceptions.includes('Roster shift unpublished')) {
    throw new Error('Publish the roster shift before approving its hours.');
  }
}
