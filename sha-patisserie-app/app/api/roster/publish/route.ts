import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { buildRosterMessage, sendEmail } from '@/lib/notify';


const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { weekStart, location } = await request.json();
    if (typeof weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return NextResponse.json({ error: 'weekStart must be a YYYY-MM-DD date' }, { status: 400 });
    }
    if (location !== 'SHA' && location !== 'ZB') {
      return NextResponse.json({ error: 'A valid venue is required' }, { status: 400 });
    }

    // Perth has no daylight saving, so a fixed +08:00 offset is safe.
    const start = new Date(`${weekStart}T00:00:00+08:00`);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'weekStart must be a valid date' }, { status: 400 });
    }
    const end = new Date(start.getTime() + 7 * DAY_MS);

    const drafts = await prisma.shift.findMany({
      where: {
        publishedAt: null,
        startTime: { gte: start, lt: end },
        location: { code: location },
      },
      select: { id: true, userId: true },
    });

    if (drafts.length === 0) {
      return NextResponse.json({ error: 'There are no draft shifts to publish for this week.' }, { status: 400 });
    }

    await prisma.shift.updateMany({
      where: { id: { in: drafts.map((shift) => shift.id) } },
      data: { publishedAt: new Date() },
    });

    // Each person gets their whole published week, not only the shifts changed now.
    const userIds = [...new Set(drafts.map((shift) => shift.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        shifts: {
          where: { publishedAt: { not: null }, startTime: { gte: start, lt: end } },
          select: { startTime: true, endTime: true },
        },
      },
    });

    let emailed = 0;
    const failures: string[] = [];
    for (const user of users) {
      if (!user.email) continue;
      const result = await sendEmail(
        user.email,
        'Your roster for this week',
        buildRosterMessage(user.name, user.shifts)
      );
      if (result.sent) emailed += 1;
      else if (!failures.includes(result.reason ?? 'Unknown error')) failures.push(result.reason ?? 'Unknown error');
    }

    return NextResponse.json({
      published: drafts.length,
      staff: users.length,
      emailed,
      emailIssue: failures[0] ?? null,
    });
  } catch (error) {
    console.error('Failed to publish roster:', error);
    return NextResponse.json({ error: 'Failed to publish roster' }, { status: 500 });
  }
}

