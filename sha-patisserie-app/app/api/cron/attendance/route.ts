import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { checkAttendanceNotifications } from '@/lib/attendance-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error('Attendance cron configuration missing: CRON_SECRET.');
    return NextResponse.json({ error: 'Attendance cron is not configured.' }, { status: 503 });
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get('authorization') || '');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await checkAttendanceNotifications();
    console.info('Attendance notification check:', result);
    return NextResponse.json(result, { status: result.failed ? 502 : 200 });
  } catch (error) {
    console.error('Attendance notification check failed:', error);
    return NextResponse.json({ error: 'Attendance notification check failed.' }, { status: 500 });
  }
}
