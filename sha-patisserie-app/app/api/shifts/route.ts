import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { findOverlappingShift, findShiftOnSameDay, overlapMessage, sameDayMessage } from '@/lib/shiftConflicts';
import { perthDate } from '@/lib/timesheets';
import { shiftUserSelect } from '@/lib/user-select';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shifts = await prisma.shift.findMany({
      where: {
        user: { role: { in: ['STAFF', 'MANAGER'] } },
        ...(isPrivilegedRole(session.role) ? {} : { publishedAt: { not: null } }),
      },
      include: {
        user: {
          select: shiftUserSelect,
        },
        location: { select: { code: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Failed to fetch shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, startTime, endTime, breakMinutes, location, roleTag, notes } = body;

    if (!userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'User, start time, and end time are required' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin accounts cannot be assigned roster shifts' }, { status: 400 });
    }

    const sameDay = await findShiftOnSameDay(userId, start);
    if (sameDay) {
      return NextResponse.json({ error: sameDayMessage(sameDay) }, { status: 409 });
    }

    const conflict = await findOverlappingShift(userId, start, end);
    if (conflict) {
      return NextResponse.json({ error: overlapMessage(conflict) }, { status: 409 });
    }

    const newShift = await prisma.shift.create({
      data: {
        user: { connect: { id: userId } },
        startTime: start,
        endTime: end,
        breakMinutes: Number(breakMinutes) || 0,
        location: {
          connectOrCreate: {
            where: { code: location === 'ZB' ? 'ZB' : 'SHA' },
            create: {
              code: location === 'ZB' ? 'ZB' : 'SHA',
              name: location === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie',
            },
          },
        },
        roleTag: roleTag || null,
        notes: notes || null,
      },
      include: {
        user: { select: shiftUserSelect },
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error('Failed to create shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, userId, startTime, endTime, breakMinutes, location, roleTag, notes } = await request.json();
    if (!id || !userId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Shift, user, start time, and end time are required' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin accounts cannot be assigned roster shifts' }, { status: 400 });
    }

    // A saved review owns its original staff/date/venue identity. Allow ordinary
    // time corrections (which invalidate approval), but not moving payroll to a
    // different employee, week or venue behind the audit trail.
    const reviewed = await prisma.timesheet.findUnique({
      where: { shiftId: id },
    });
    const targetCode = location === 'ZB' ? 'ZB' : 'SHA';
    const targetVenue = reviewed ? await prisma.location.findUnique({ where: { code: targetCode } }) : null;
    if (reviewed && (reviewed.userId !== userId ||
        reviewed.workDate.toISOString().slice(0, 10) !== perthDate(start) ||
        reviewed.site !== targetVenue?.name)) {
      return NextResponse.json({
        error: 'A reviewed shift cannot be reassigned to another staff member, date or venue. Keep the original shift for payroll history.',
      }, { status: 409 });
    }

    const sameDay = await findShiftOnSameDay(userId, start, id);
    if (sameDay) {
      return NextResponse.json({ error: sameDayMessage(sameDay) }, { status: 409 });
    }

    const conflict = await findOverlappingShift(userId, start, end, id);
    if (conflict) {
      return NextResponse.json({ error: overlapMessage(conflict) }, { status: 409 });
    }

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        publishedAt: null,
        user: { connect: { id: userId } },
        startTime: start,
        endTime: end,
        breakMinutes: Number(breakMinutes) || 0,
        location: {
          connectOrCreate: {
            where: { code: location === 'ZB' ? 'ZB' : 'SHA' },
            create: {
              code: location === 'ZB' ? 'ZB' : 'SHA',
              name: location === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie',
            },
          },
        },
        roleTag: roleTag || null,
        notes: notes || null,
      },
      include: {
        user: { select: shiftUserSelect },
        location: { select: { code: true, name: true } },
      },
    });

    return NextResponse.json(updatedShift);
  } catch (error) {
    console.error('Failed to update shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
  }

  try {
    await prisma.shift.delete({ where: { id } });
    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({
        error: 'This shift has a saved timesheet review and must be retained for payroll history. Reopen the review to correct its payable hours.',
      }, { status: 409 });
    }
    console.error('Failed to delete shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
