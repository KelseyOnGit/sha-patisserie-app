// Save as: app/api/admin/reports/manual-shift/route.ts
//
// Lets an admin or manager add a shift that was worked but never rostered.
// It creates a normal, already-published roster shift tagged "Timesheet entry",
// so it then behaves exactly like any other scheduled shift on the timesheet page
// (hours and break editable, reviewable, approvable, included in payroll).

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { findOverlappingShift, findShiftOnSameDay, overlapMessage, sameDayMessage } from '@/lib/shiftConflicts';
import { perthDate } from '@/lib/timesheets';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    const { userId, workDate, startTime, endTime, venue, reason } = body ?? {};
    const breakMinutes = Number(body?.breakMinutes);

    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'Choose a staff member.' }, { status: 400 });
    }
    if (typeof workDate !== 'string' || !DATE_PATTERN.test(workDate)) {
      return NextResponse.json({ error: 'Choose a valid date.' }, { status: 400 });
    }
    if (typeof startTime !== 'string' || typeof endTime !== 'string' ||
        !TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
      return NextResponse.json({ error: 'Enter a valid start and end time.' }, { status: 400 });
    }
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 240) {
      return NextResponse.json({ error: 'Break must be a whole number of minutes from 0 to 240.' }, { status: 400 });
    }
    const note = typeof reason === 'string' ? reason.trim() : '';
    if (!note) {
      return NextResponse.json({ error: 'Add a short reason for this shift.' }, { status: 400 });
    }
    if (note.length > 2000) {
      return NextResponse.json({ error: 'The reason must be 2,000 characters or fewer.' }, { status: 400 });
    }

    // Perth has no daylight saving, so a fixed +08:00 offset is safe.
    const start = new Date(`${workDate}T${startTime}:00+08:00`);
    let end = new Date(`${workDate}T${endTime}:00+08:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || perthDate(start) !== workDate) {
      return NextResponse.json({ error: 'Choose a valid date.' }, { status: 400 });
    }
    // An end time earlier than the start means the shift ran past midnight.
    if (end <= start) end = new Date(end.getTime() + 86400000);
    if (end.getTime() > Date.now()) {
      return NextResponse.json({ error: 'A worked shift must already be finished. Future hours cannot be paid.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin accounts cannot be assigned shifts.' }, { status: 400 });
    }

    // Staff who have left are allowed here on purpose: a missed final shift still has to be paid.

    const sameDay = await findShiftOnSameDay(userId, start);
    if (sameDay) {
      return NextResponse.json({
        error: `${sameDayMessage(sameDay)} Open that shift in the table and edit its hours instead.`,
      }, { status: 409 });
    }
    const conflict = await findOverlappingShift(userId, start, end);
    if (conflict) {
      return NextResponse.json({ error: overlapMessage(conflict) }, { status: 409 });
    }

    const code = venue === 'ZB' ? 'ZB' : 'SHA';
    const shift = await prisma.shift.create({
      data: {
        user: { connect: { id: userId } },
        startTime: start,
        endTime: end,
        breakMinutes,
        publishedAt: new Date(), // already published, so no roster email is sent and payroll can include it
        roleTag: 'Timesheet entry',
        notes: note,
        location: {
          connectOrCreate: {
            where: { code },
            create: { code, name: code === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie' },
          },
        },
      },
      select: { id: true, startTime: true, endTime: true, breakMinutes: true },
    });

    return NextResponse.json({
      shiftId: shift.id,
      sourceKey: `shift:${shift.id}`,
      startTime: shift.startTime.toISOString(),
      endTime: shift.endTime.toISOString(),
      breakMinutes: shift.breakMinutes,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to add worked shift:', error);
    return NextResponse.json({ error: 'Failed to add the shift.' }, { status: 500 });
  }
}
