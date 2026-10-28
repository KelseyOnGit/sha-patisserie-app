import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

function getPerthDateStr(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function formatPerthTime(d: Date | string, targetDate?: string): string {
  const dateObj = new Date(d);
  const logDateStr = getPerthDateStr(dateObj);
  const timeStr = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);

  if (targetDate && logDateStr !== targetDate) {
    const dayStr = new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Perth',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
    return `${dayStr}, ${timeStr}`;
  }
  return timeStr;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get('date') || getPerthDateStr();

    const startUtc = new Date(`${targetDate}T00:00:00+08:00`);
    const endUtc = new Date(`${targetDate}T23:59:59.999+08:00`);
    const now = new Date();

    // 1. Fetch scheduled shifts for the target date (excluding ADMIN users without explicit roster requirements)
    const shifts = await prisma.shift.findMany({
      where: {
        startTime: { gte: startUtc, lte: endUtc },
        user: {
          role: { in: ['STAFF', 'MANAGER'] },
          status: { not: 'INACTIVE' },
        },
      },
      include: {
        user: true,
        location: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // 2. Fetch time logs that were punched on this date (or unclosed within last 16h) for staff/managers
    // Stale punches (>16 hours old) from previous dates are excluded from "today's active" attendance.
    const sixteenHoursAgo = new Date(now.getTime() - 16 * 60 * 60 * 1000);
    const logs = await prisma.timeLog.findMany({
      where: {
        user: {
          role: { in: ['STAFF', 'MANAGER'] },
          status: { not: 'INACTIVE' },
        },
        OR: [
          { clockIn: { gte: startUtc, lte: endUtc } },
          { clockOut: null, clockIn: { gte: sixteenHoursAgo } },
        ],
      },
      include: {
        user: true,
        location: true,
      },
      orderBy: { clockIn: 'desc' },
    });

    const matchedLogIds = new Set<string>();
    const rows = [];

    // 3. Match scheduled shifts to attendance logs
    for (const shift of shifts) {
      // Find matching log for shift's user: prefer open log or log from this shift window
      const matchingLog = logs.find(
        (l) => l.userId === shift.userId && !matchedLogIds.has(l.id)
      );

      let status = 'SCHEDULED';
      let actualArrival: string | null = null;

      if (matchingLog) {
        matchedLogIds.add(matchingLog.id);
        actualArrival = formatPerthTime(matchingLog.clockIn, targetDate);

        if (matchingLog.clockOut === null) {
          if (shift.startBreak && !shift.endBreak) {
            status = 'ON_BREAK';
          } else {
            status = 'CLOCKED_IN';
          }
        } else {
          status = 'COMPLETED';
        }
      } else {
        const shiftStartMs = new Date(shift.startTime).getTime();
        const nowMs = now.getTime();
        if (nowMs >= shiftStartMs + 2 * 60 * 60 * 1000) {
          status = 'POSSIBLE_ABSENCE';
        } else if (nowMs >= shiftStartMs + 15 * 60 * 1000) {
          status = 'LATE';
        } else {
          status = 'SCHEDULED';
        }
      }

      const scheduled = `${formatPerthTime(shift.startTime)} - ${formatPerthTime(shift.endTime)}`;
      const site = shift.location?.name || matchingLog?.location?.name || 'Sha Patisserie';

      rows.push({
        id: `shift-${shift.id}`,
        staffName: shift.user?.name || 'Unnamed Staff',
        site,
        scheduled,
        actualArrival,
        status,
      });
    }

    // 4. Handle unscheduled or extra clock-ins
    for (const log of logs) {
      if (matchedLogIds.has(log.id)) continue;

      const actualArrival = formatPerthTime(log.clockIn, targetDate);
      const status = log.clockOut === null ? 'CLOCKED_IN' : 'COMPLETED';
      const site = log.location?.name || 'Sha Patisserie';

      rows.push({
        id: `log-${log.id}`,
        staffName: log.user?.name || 'Unnamed Staff',
        site,
        scheduled: 'Unscheduled',
        actualArrival,
        status,
      });
    }

    // Calculate summary statistics
    const summary = {
      clockedIn: rows.filter((r) => r.status === 'CLOCKED_IN').length,
      onBreak: rows.filter((r) => r.status === 'ON_BREAK').length,
      late: rows.filter((r) => r.status === 'LATE').length,
      possibleAbsence: rows.filter((r) => r.status === 'POSSIBLE_ABSENCE').length,
      scheduled: rows.filter((r) => r.status === 'SCHEDULED').length,
      completed: rows.filter((r) => r.status === 'COMPLETED').length,
    };

    return NextResponse.json({
      date: targetDate,
      rows,
      summary,
      serverNow: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to load admin attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
