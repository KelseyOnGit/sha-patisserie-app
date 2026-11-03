import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

function isPrivilegedRole(role?: string) {
  return role === 'ADMIN' || role === 'MANAGER';
}

export async function POST(request: Request) {
  // 1. Session and Auth Check
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    const { userId, timeLogId, clockOut } = body ?? {};

    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    if (typeof timeLogId !== 'string' || !timeLogId) {
      return NextResponse.json({ error: 'Time log ID is required.' }, { status: 400 });
    }
    if (typeof clockOut !== 'string' || !clockOut) {
      return NextResponse.json({ error: 'Clock-out time is required.' }, { status: 400 });
    }

    const clockOutDate = new Date(clockOut);
    if (Number.isNaN(clockOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid clock-out timestamp.' }, { status: 400 });
    }

    const now = new Date();

    // 2. Load the log to validate conditions
    const timeLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId },
    });

    if (!timeLog || timeLog.userId !== userId) {
      return NextResponse.json({ error: 'Time log not found.' }, { status: 404 });
    }

    // Condition A: clockOut must currently be null
    if (timeLog.clockOut !== null) {
      return NextResponse.json(
        { error: 'This shift has already been clocked out.' },
        { status: 400 }
      );
    }

    const clockInDate = new Date(timeLog.clockIn);

    // Condition B: new time must be after clockIn
    if (clockOutDate <= clockInDate) {
      return NextResponse.json(
        { error: 'Clock-out time must be after the clock-in time.' },
        { status: 400 }
      );
    }

    // Condition C: new time cannot be in the future
    if (clockOutDate > now) {
      return NextResponse.json(
        { error: 'Clock-out time cannot be in the future.' },
        { status: 400 }
      );
    }

    // Condition D: duration gap no more than 16 hours
    const sixteenHoursMs = 16 * 60 * 60 * 1000;
    if (clockOutDate.getTime() - clockInDate.getTime() > sixteenHoursMs) {
      return NextResponse.json(
        { error: 'Shift duration cannot exceed 16 hours.' },
        { status: 400 }
      );
    }

    // 3. Database operations inside a transaction
    const updatedLog = await prisma.$transaction(async (tx) => {
      // Determine if there is an open break on this time log (startBreak is set, endBreak is null)
      const hasOpenBreak = timeLog.startBreak !== null && timeLog.endBreak === null;

      // Update the timeLog: clock out and close open break if one exists
      const log = await tx.timeLog.update({
        where: { id: timeLogId },
        data: {
          clockOut: clockOutDate,
          ...(hasOpenBreak ? { endBreak: clockOutDate } : {}),
        },
      });

      return log;
    });

    return NextResponse.json(
      {
        message: 'Staff clocked out successfully.',
        timeLog: updatedLog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to admin clock-out staff:', error);
    return NextResponse.json(
      { error: 'Failed to clock out staff.' },
      { status: 500 }
    );
  }
}