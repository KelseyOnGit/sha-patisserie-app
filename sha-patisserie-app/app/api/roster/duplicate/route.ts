import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { weekStart, location } = await request.json();
    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart is required' }, { status: 400 });
    }
    if (location !== 'SHA' && location !== 'ZB') {
      return NextResponse.json({ error: 'A valid venue is required' }, { status: 400 });
    }

    const startOfWeek = new Date(weekStart);
    if (Number.isNaN(startOfWeek.getTime())) {
      return NextResponse.json({ error: 'weekStart must be a valid date' }, { status: 400 });
    }
    const endOfWeek = new Date(startOfWeek.getTime() + WEEK_MS);
    const targetEndOfWeek = new Date(endOfWeek.getTime() + WEEK_MS);

    // 1. Fetch current week's source shifts
    const sourceShifts = await prisma.shift.findMany({
      where: {
        user: { role: { in: ['STAFF', 'MANAGER'] }, status: { not: 'INACTIVE' } },
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
        location: { code: location },
      },
    });

    if (sourceShifts.length === 0) {
      return NextResponse.json({ message: 'No shifts found for the selected week', count: 0 });
    }

    // 2. Process inside a transaction to prevent race conditions
    const result = await prisma.$transaction(async (transaction) => {
      // Fetch any existing shifts already scheduled for the next week
      const existingShifts = await transaction.shift.findMany({
        where: {
          startTime: { gte: endOfWeek, lt: targetEndOfWeek },
          location: { code: location },
        },
        select: {
          userId: true,
          startTime: true,
        },
      });

      // Create a lookup set (stringifying userId + timestamp) for instant checking
      const existingShiftSet = new Set(
        existingShifts.map((s) => `${s.userId}_${s.startTime.getTime()}`)
      );

      // Filter out target shifts that already exist
      const nonConflictingShifts = sourceShifts
        .map((shift) => {
          const targetStartTime = new Date(shift.startTime.getTime() + WEEK_MS);
          const targetEndTime = new Date(shift.endTime.getTime() + WEEK_MS);
          
          return {
            userId: shift.userId,
            startTime: targetStartTime,
            endTime: targetEndTime,
            presetBreakMinutes: shift.presetBreakMinutes,
            breakMinutes: shift.breakMinutes,
            locationId: shift.locationId,
            roleTag: shift.roleTag,
            notes: shift.notes,
            publishedAt: null,
          };
        })
        .filter((shift) => {
          const key = `${shift.userId}_${shift.startTime.getTime()}`;
          return !existingShiftSet.has(key);
        });

      // If everything was a duplicate, skip creation step safely
      if (nonConflictingShifts.length === 0) {
        return { count: 0 };
      }

      const created = await transaction.shift.createMany({
        data: nonConflictingShifts,
      });

      return { count: created.count };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json(
      { message: 'Roster filled for missing slots', count: result.count }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to duplicate roster:', error);
    return NextResponse.json({ error: 'Failed to duplicate roster' }, { status: 500 });
  }
}

