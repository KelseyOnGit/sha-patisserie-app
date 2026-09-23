//Build API endpoints /api/shifts/start-break and /api/shifts/end-break

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { shiftId, action, managerOverride } = await req.json(); // action: "START" | "FINISH" | "TOGGLE_APPROVE"

    if (!shiftId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Manager Manual Checkbox Toggle
    if (action === 'TOGGLE_APPROVE') {
      const currentShift = await prisma.shift.findUnique({ where: { id: shiftId } });
      if (!currentShift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 });

      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: { breakApproved: !currentShift.breakApproved },
      });
      return NextResponse.json({ message: 'Break approval updated', shift: updatedShift });
    }

    // 2. Staff Clocking "Start Break"
    if (action === 'START') {
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