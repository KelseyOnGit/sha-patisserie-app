import { NextResponse } from 'next/server';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { loadTimesheetReport } from '@/lib/timesheet-report';
import { weekBounds } from '@/lib/timesheets';

export async function GET(req: Request) {
  const started = performance.now();
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
    const reportStarted = performance.now();
    const report = await loadTimesheetReport(weekStart);
    const reportMs = performance.now() - reportStarted;
    return NextResponse.json(report, {
      headers: { 'Server-Timing': `report;dur=${reportMs.toFixed(1)}, total;dur=${(performance.now() - started).toFixed(1)}` },
    });
  } catch (error) {
    console.error('Failed to load timesheet review:', error);
    return NextResponse.json({ error: 'Unable to load timesheets. Check that the timesheet database migration has been applied.' }, { status: 500 });
  }
}
