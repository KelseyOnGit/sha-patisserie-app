import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, isPrivilegedRole } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalStaff, pendingUsers, upcomingShifts] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE', role: { in: ['STAFF', 'MANAGER'] } } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.shift.count({ where: { user: { role: { in: ['STAFF', 'MANAGER'] } }, startTime: { gte: now, lt: weekFromNow } } }),
    ]);

    return NextResponse.json({
      totalStaff,
      pendingUsers,
      upcomingShifts,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
