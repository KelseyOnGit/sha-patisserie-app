import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { activeAttendanceBreak } from '@/lib/attendance-breaks';

class BreakError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const active = await activeAttendanceBreak(prisma, session.userId);
    return NextResponse.json({ session: active?.session ?? null });
  } catch (error) {
    console.error('Failed to fetch break status:', error);
    return NextResponse.json({ error: 'Unable to load break status. Refresh or ask a manager for help.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json().catch(() => null);
    if (!body || !['START', 'FINISH'].includes(body.action) ||
        typeof body.sessionId !== 'string' || !body.sessionId) {
      throw new BreakError('Choose an active clock-in session and START or FINISH.', 400);
    }
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const active = await activeAttendanceBreak(tx, session.userId, now);
      if (!active || active.log.id !== body.sessionId) {
        throw new BreakError('Your clock-in session changed or expired. Refresh before recording a break.');
      }
      const { log, legacyShift } = active;
      if (body.action === 'START' && (active.session.startBreak || active.session.endBreak)) {
        throw new BreakError('A break has already been recorded for this clock-in session.');
      }
      if (body.action === 'FINISH' && (!active.session.startBreak || active.session.endBreak)) {
        throw new BreakError('There is no unfinished break. Refresh the break status.');
      }
      // Finish legacy breaks in their original record; do not copy them into
      // attendance and accidentally deduct the same break twice in payroll.
      if (legacyShift) {
        const updated = await tx.shift.updateMany({
          where: { id: legacyShift.id, startBreak: legacyShift.startBreak, endBreak: null },
          data: { endBreak: now },
        });
        if (updated.count !== 1) throw new BreakError('Break changed. Refresh and retry.');
      } else {
        const updated = await tx.timeLog.updateMany({
          where: { id: log.id, userId: session.userId, clockOut: null,
            startBreak: log.startBreak, endBreak: log.endBreak },
          data: body.action === 'START' ? { startBreak: now } : { endBreak: now },
        });
        if (updated.count !== 1) throw new BreakError('Attendance or break changed. Refresh and retry.');
      }
      return { ...active.session,
        ...(body.action === 'START' ? { startBreak: now } : { endBreak: now }) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ message: body.action === 'START' ? 'Break started.' : 'Break finished.', session: result });
  } catch (error) {
    if (error instanceof BreakError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Attendance changed. Refresh and retry.' }, { status: 409 });
    }
    console.error('Failed to update attendance break:', error);
    return NextResponse.json({ error: 'Unable to update break. Refresh or ask a manager for help.' }, { status: 500 });
  }

}
