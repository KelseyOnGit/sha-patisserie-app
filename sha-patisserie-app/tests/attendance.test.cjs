const test = require('node:test');
const assert = require('node:assert/strict');

function getPerthDateStr(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function formatPerthTime(d, targetDate) {
  const dateObj = new Date(d);
  const logDateStr = getPerthDateStr(dateObj);
  const timeStr = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);

  if (targetDate && logDateStr !== targetDate) {
    const dayStr = new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Perth',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
    return `${dayStr}, ${timeStr}`;
  }
  return timeStr;
}

function calculateAttendanceRows({ shifts, logs, targetDate, now }) {
  const matchedLogIds = new Set();
  const rows = [];

  for (const shift of shifts) {
    const matchingLog = logs.find(
      (l) => l.userId === shift.userId && !matchedLogIds.has(l.id)
    );

    let status = 'SCHEDULED';
    let actualArrival = null;

    if (matchingLog) {
      matchedLogIds.add(matchingLog.id);
      actualArrival = formatPerthTime(matchingLog.clockIn, targetDate);

      if (matchingLog.clockOut === null) {
        if (shift.startBreak && !shift.endBreak) {
          status = 'ON_BREAK';
        } else {
          status = 'CLOCKED_IN';
        }
      } else {
        status = 'COMPLETED';
      }
    } else {
      const shiftStartMs = new Date(shift.startTime).getTime();
      const nowMs = now.getTime();
      if (nowMs >= shiftStartMs + 2 * 60 * 60 * 1000) {
        status = 'POSSIBLE_ABSENCE';
      } else if (nowMs >= shiftStartMs + 15 * 60 * 1000) {
        status = 'LATE';
      } else {
        status = 'SCHEDULED';
      }
    }

    const scheduled = `${formatPerthTime(shift.startTime)} - ${formatPerthTime(shift.endTime)}`;
    const site = shift.location?.name || matchingLog?.location?.name || 'Sha Patisserie';

    rows.push({
      id: `shift-${shift.id}`,
      staffName: shift.user?.name || 'Unnamed Staff',
      site,
      scheduled,
      actualArrival,
      status,
    });
  }

  for (const log of logs) {
    if (matchedLogIds.has(log.id)) continue;

    const actualArrival = formatPerthTime(log.clockIn, targetDate);
    const status = log.clockOut === null ? 'CLOCKED_IN' : 'COMPLETED';
    const site = log.location?.name || 'Sha Patisserie';

    rows.push({
      id: `log-${log.id}`,
      staffName: log.user?.name || 'Unnamed Staff',
      site,
      scheduled: 'Unscheduled',
      actualArrival,
      status,
    });
  }

  return rows;
}

test('attendance categorizes active clock-ins, on-break status and unscheduled punches', () => {
  const targetDate = '2026-10-13';
  const now = new Date('2026-10-13T03:00:00Z'); // 11:00 AM Perth time

  const shifts = [
    {
      id: 's1',
      userId: 'u-julia',
      user: { name: 'Julia' },
      location: { name: 'Sha Patisserie' },
      startTime: new Date('2026-10-13T01:00:00Z'), // 09:00 AM Perth
      endTime: new Date('2026-10-13T09:00:00Z'),   // 05:00 PM Perth
      startBreak: new Date('2026-10-13T02:30:00Z'),
      endBreak: null,
    },
    {
      id: 's2',
      userId: 'u-late',
      user: { name: 'Alex' },
      location: { name: 'Sha Patisserie' },
      startTime: new Date('2026-10-13T02:00:00Z'), // 10:00 AM Perth (1h ago)
      endTime: new Date('2026-10-13T10:00:00Z'),
      startBreak: null,
      endBreak: null,
    },
    {
      id: 's3',
      userId: 'u-absent',
      user: { name: 'Bob' },
      location: { name: 'Zushi Bento' },
      startTime: new Date('2026-10-12T23:00:00Z'), // 07:00 AM Perth (4h ago)
      endTime: new Date('2026-10-13T07:00:00Z'),
      startBreak: null,
      endBreak: null,
    },
  ];

  const logs = [
    {
      id: 'l1',
      userId: 'u-julia',
      user: { name: 'Julia' },
      location: { name: 'Sha Patisserie' },
      clockIn: new Date('2026-10-13T00:55:00Z'), // 08:55 AM Perth
      clockOut: null,
    },
    {
      id: 'l2',
      userId: 'u-vanessa',
      user: { name: 'Vanessa Chia' },
      location: { name: 'Sha Patisserie' },
      clockIn: new Date('2026-10-13T01:30:00Z'),
      clockOut: null,
    },
  ];

  const rows = calculateAttendanceRows({ shifts, logs, targetDate, now });

  const juliaRow = rows.find((r) => r.staffName === 'Julia');
  assert.ok(juliaRow);
  assert.equal(juliaRow.status, 'ON_BREAK');
  assert.equal(juliaRow.site, 'Sha Patisserie');

  const alexRow = rows.find((r) => r.staffName === 'Alex');
  assert.ok(alexRow);
  assert.equal(alexRow.status, 'LATE');
  assert.equal(alexRow.actualArrival, null);

  const bobRow = rows.find((r) => r.staffName === 'Bob');
  assert.ok(bobRow);
  assert.equal(bobRow.status, 'POSSIBLE_ABSENCE');
  assert.equal(bobRow.actualArrival, null);

  const vanessaRow = rows.find((r) => r.staffName === 'Vanessa Chia');
  assert.ok(vanessaRow);
  assert.equal(vanessaRow.status, 'CLOCKED_IN');
  assert.equal(vanessaRow.scheduled, 'Unscheduled');
});
