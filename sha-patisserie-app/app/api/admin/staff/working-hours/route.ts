import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function isWorkingHours(value: unknown): value is Record<string, {
  enabled: boolean;
  startTime: string;
  endTime: string;
  additionalHours?: { startTime: string; endTime: string }[];
  standardHours: string;
  breakMinutes?: number;
}> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const schedule = value as Record<string, unknown>;
  return days.every((day) => {
    const config = schedule[day];
    if (!config || typeof config !== 'object' || Array.isArray(config)) return false;

    const fields = config as Record<string, unknown>;
    const validTime = (time: unknown) =>
      typeof time === 'string' &&
      (time === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(time));
    const validAdditionalHours = fields.additionalHours === undefined || (
      Array.isArray(fields.additionalHours) &&
      fields.additionalHours.length <= 5 &&
      fields.additionalHours.every((range) =>
        range !== null &&
        typeof range === 'object' &&
        !Array.isArray(range) &&
        validTime((range as Record<string, unknown>).startTime) &&
        validTime((range as Record<string, unknown>).endTime)
      )
    );

    return typeof fields.enabled === 'boolean' &&
      validTime(fields.startTime) &&
      validTime(fields.endTime) &&
      validAdditionalHours &&
      typeof fields.standardHours === 'string' &&
      (fields.breakMinutes === undefined || (
        typeof fields.breakMinutes === 'number' &&
        Number.isInteger(fields.breakMinutes) &&
        fields.breakMinutes >= 0 &&
        fields.breakMinutes <= 240
      ));
  });
}

function canAccessUser(session: { userId: string; role?: string }, userId: string) {
  return userId === session.userId || isPrivilegedRole(session.role);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestedUserId = new URL(request.url).searchParams.get('userId');
  const userId = requestedUserId || session.userId;
  if (!canAccessUser(session, userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workingHoursPolicy: true, regularWorkingHours: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({
      workingHoursPolicy: user.workingHoursPolicy.toLowerCase(),
      workingHours: user.regularWorkingHours,
    });
  } catch (error) {
    console.error('Failed to fetch regular working hours:', error);
    return NextResponse.json({ error: 'Failed to fetch regular working hours' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId : session.userId;
    if (!canAccessUser(session, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { workingHoursPolicy, workingHours } = body;
    if (
      !['policy', 'custom'].includes(workingHoursPolicy) ||
      !isWorkingHours(workingHours)
    ) {
      return NextResponse.json({ error: 'Invalid working-hours details' }, { status: 400 });
    }

    const scheduleWithBreaks = Object.fromEntries(
      days.map((day) => {
        const daySchedule = workingHours[day];
        return [day, {
          ...daySchedule,
          additionalHours: daySchedule.additionalHours ?? [],
          breakMinutes: daySchedule.breakMinutes ?? (daySchedule.enabled ? 30 : 0),
        }];
      })
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        workingHoursPolicy: workingHoursPolicy.toUpperCase(),
        regularWorkingHours: scheduleWithBreaks as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return NextResponse.json({ message: 'Working hours saved successfully', userId: user.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    console.error('Failed to save regular working hours:', error);
    return NextResponse.json({ error: 'Failed to save regular working hours' }, { status: 500 });
  }
}