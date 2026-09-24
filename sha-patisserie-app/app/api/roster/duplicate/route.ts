import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { weekStart } = await request.json();
    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart is required' }, { status: 400 });
    }

    const startOfWeek = new Date(weekStart);
    if (Number.isNaN(startOfWeek.getTime())) {
      return NextResponse.json({ error: 'weekStart must be a valid date' }, { status: 400 });
    }
    const endOfWeek = new Date(startOfWeek.getTime() + WEEK_MS);

    const sourceShifts = await prisma.shift.findMany({
      where: {
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    if (sourceShifts.length === 0) {
      return NextResponse.json({ message: 'No shifts found for the selected week', count: 0 });
    }

    const duplicatedShifts = sourceShifts.map((shift) => ({
      userId: shift.userId,
      startTime: new Date(shift.startTime.getTime() + WEEK_MS),
      endTime: new Date(shift.endTime.getTime() + WEEK_MS),
      presetBreakMinutes: shift.presetBreakMinutes,
      breakMinutes: shift.breakMinutes,
      locationId: shift.locationId,
      roleTag: shift.roleTag,
      notes: shift.notes,
    }));

    const result = await prisma.shift.createMany({ data: duplicatedShifts });

    return NextResponse.json({ message: 'Roster duplicated', count: result.count }, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate roster:', error);
    return NextResponse.json({ error: 'Failed to duplicate roster' }, { status: 500 });
  }
}
