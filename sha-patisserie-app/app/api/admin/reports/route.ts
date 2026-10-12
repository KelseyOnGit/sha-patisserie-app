import { NextResponse } from 'next/server';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { loadTimesheetReport } from '@/lib/timesheet-report';
import { weekBounds } from '@/lib/timesheets';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isPrivilegedRole(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const weekStart = new URL(req.url).searchParams.get('weekStart') ?? '';
  try {
    weekBounds(weekStart);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid week' }, { status: 400 });
  }
  try {
    return NextResponse.json(await loadTimesheetReport(weekStart));
  } catch (error) {
    console.error('Failed to load timesheet review:', error);
    return NextResponse.json({ error: 'Unable to load timesheets. Check that the timesheet database migration has been applied.' }, { status: 500 });
  }
}
