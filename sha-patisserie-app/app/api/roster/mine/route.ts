import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch upcoming shifts for the logged-in staff member
    const shifts = await prisma.shift.findMany({
      where: {
        userId: session.userId,
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today from 00:00
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        location: {
          select: { code: true, name: true },
        },
      },
    });

    // Format timestamps for display
    const formattedShifts = shifts.map((shift) => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);

      return {
        id: shift.id,
        venue: shift.location?.name || shift.location?.code || 'Unassigned',
        day: start.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        startTime: start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        endTime: end.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };
    });

    return NextResponse.json({ shifts: formattedShifts });
  } catch (error) {
    console.error('Failed to fetch roster:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}