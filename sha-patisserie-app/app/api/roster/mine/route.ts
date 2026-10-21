import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { perthToday, LEAVE_LABELS, LEAVE_STATUS_LABELS } from '@/lib/leave';
import { upcomingHolidays } from '@/lib/holidays';

const TZ = 'Australia/Perth';

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const dayLabel = (d: Date, timeZone = TZ) =>
  d.toLocaleDateString('en-AU', { timeZone, weekday: 'short', day: 'numeric', month: 'short' });
const timeLabel = (d: Date) =>
  d.toLocaleTimeString('en-AU', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = perthToday(); // UTC-midnight Date of today's Perth date
    const todayKey = today.toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayKey}T00:00:00+08:00`);

    const [shifts, leave] = await Promise.all([
      prisma.shift.findMany({
        where: { userId: session.userId, publishedAt: { not: null }, startTime: { gte: startOfToday } },
        orderBy: { startTime: 'asc' },
        include: { location: { select: { code: true, name: true } } },
      }),
      prisma.leaveRequest.findMany({
        where: {
          userId: session.userId,
          workDate: { gte: today },
          status: { in: ['PENDING', 'APPROVED', 'CANCEL_REQUESTED'] },
        },
        orderBy: { workDate: 'asc' },
      }),
    ]);

    return NextResponse.json({
      shifts: shifts.map((shift) => ({
        id: shift.id,
        date: dayKey(shift.startTime),
        day: dayLabel(shift.startTime),
        venue: shift.location?.name || shift.location?.code || 'Unassigned',
        startTime: timeLabel(shift.startTime),
        endTime: timeLabel(shift.endTime),
      })),
      leave: leave.map((entry) => ({
        id: entry.id,
        date: entry.workDate.toISOString().slice(0, 10),
        day: dayLabel(entry.workDate, 'UTC'), // leave dates are stored as UTC midnight
        type: LEAVE_LABELS[entry.type] ?? entry.type,
        status: entry.status,
        statusLabel: LEAVE_STATUS_LABELS[entry.status] ?? entry.status,
        hours: Number(entry.hours),
      })),
      holidays: upcomingHolidays(todayKey, 60).map((holiday) => ({
        ...holiday,
        day: dayLabel(new Date(`${holiday.date}T00:00:00Z`), 'UTC'),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch roster:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}