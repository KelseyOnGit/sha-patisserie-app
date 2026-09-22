import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shifts = await prisma.shift.findMany({
      include: {
        user: {
          select: { id: true, name: true, role: true, employmentType: true, location: true },
        },
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

    const newShift = await prisma.shift.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        breakMinutes: Number(breakMinutes) || 0,
        location: location || 'Sha',
        roleTag: roleTag || null,
        notes: notes || null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error('Failed to create shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}