//Build API endpoints /api/shifts/start-break and /api/shifts/end-break

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function findCurrentShift(userId: string) {
  const now = new Date();

  return prisma.shift.findFirst({
    where: {
      userId,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    orderBy: { startTime: 'desc' },
  });
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shift = await findCurrentShift(session.userId);
    return NextResponse.json({ shift });
  } catch (error) {
    console.error('Failed to fetch break status:', error);
    return NextResponse.json({ error: 'Failed to fetch break status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shiftId: requestedShiftId, action } = await req.json();
    const shift = requestedShiftId
      ? await prisma.shift.findFirst({ where: { id: requestedShiftId, userId: session.userId } })
      : await findCurrentShift(session.userId);

    if (!shift || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shiftId = shift.id;

    // 1. Manager Manual Checkbox Toggle
    if (action === 'TOGGLE_APPROVE') {
      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: { breakApproved: !shift.breakApproved },
      });
      return NextResponse.json({ message: 'Break approval updated', shift: updatedShift });
    }

    // 2. Staff Clocking "Start Break"
    if (action === 'START') {
      if (shift.startBreak || shift.endBreak) {
        return NextResponse.json({ error: 'Break has already been recorded.' }, { status: 400 });
      }

      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          startBreak: new Date(),
          breakApproved: true, // Auto-ticks once started
        },
      });
      return NextResponse.json({ message: 'Break started', shift: updatedShift });
    }

    // 3. Staff Clocking "Finish Break"
    if (action === 'FINISH') {
      const currentShift = await prisma.shift.findUnique({ where: { id: shiftId } });
      if (!currentShift || !currentShift.startBreak) {
        return NextResponse.json({ error: 'Break start time missing' }, { status: 400 });
      }

      const endBreak = new Date();
      const durationMs = endBreak.getTime() - new Date(currentShift.startBreak).getTime();
      const breakMinutes = Math.round(durationMs / (1000 * 60));

      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          endBreak,
          breakMinutes: currentShift.breakMinutes + breakMinutes,
        },
      });
      return NextResponse.json({ message: 'Break completed', shift: updatedShift });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling break route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}