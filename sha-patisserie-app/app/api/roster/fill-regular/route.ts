import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { WORKING_DAYS, regularHoursFor, type WorkingHoursMap } from '@/lib/workingHours';

const HOUR_MS = 60 * 60 * 1000;

// Perth has no daylight saving, so a fixed +08:00 offset is safe.
const perthDay = (date: Date) => new Date(date.getTime() + 8 * HOUR_MS).toISOString().slice(0, 10);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { weekStart, location } = await request.json();
    if (typeof weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return NextResponse.json({ error: 'weekStart must be a YYYY-MM-DD date' }, { status: 400 });
    }
    if (location !== 'SHA' && location !== 'ZB') {
      return NextResponse.json({ error: 'A valid venue is required' }, { status: 400 });
    }

    const start = new Date(`${weekStart}T00:00:00+08:00`);
    if (Number.isNaN(start.getTime()) || new Date(`${weekStart}T12:00:00+08:00`).getUTCDay() !== 1) {
      return NextResponse.json({ error: 'weekStart must be a Monday' }, { status: 400 });
    }
    const end = new Date(start.getTime() + 7 * 24 * HOUR_MS);

    const venue = await prisma.location.findUnique({ where: { code: location }, select: { id: true } });
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { location: { code: location }, status: { not: 'INACTIVE' } },
      select: {
        id: true,
        regularWorkingHours: true,
        shifts: { where: { startTime: { gte: start, lt: end } }, select: { startTime: true } },
      },
    });

    const [year, month, day] = weekStart.split('-').map(Number);
    const drafts = users.flatMap((user) => {
      const busyDays = new Set(user.shifts.map((shift) => perthDay(shift.startTime)));
      const schedule = user.regularWorkingHours as Partial<WorkingHoursMap> | null;

      return WORKING_DAYS.flatMap((weekday, index) => {
        const date = new Date(Date.UTC(year, month - 1, day + index)).toISOString().slice(0, 10);
        const regular = regularHoursFor(schedule, weekday);
        if (!regular || busyDays.has(date)) return [];

        const startTime = new Date(`${date}T${regular.startTime}:00+08:00`);
        const endTime = new Date(`${date}T${regular.endTime}:00+08:00`);
        if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime) return [];

        return [{
          userId: user.id,
          locationId: venue.id,
          startTime,
          endTime,
          breakMinutes: Number.isInteger(regular.breakMinutes) ? regular.breakMinutes : 30,
        }];
      });
    });

    const result = drafts.length ? await prisma.shift.createMany({ data: drafts }) : { count: 0 };
    return NextResponse.json({ created: result.count });
  } catch (error) {
    console.error('Failed to fill roster from regular hours:', error);
    return NextResponse.json({ error: 'Failed to fill roster from regular hours' }, { status: 500 });
  }
}
