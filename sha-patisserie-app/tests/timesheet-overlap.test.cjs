/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { Prisma } = require('@prisma/client');

const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};

function fixture() {
  const user = { id: 'julia', name: 'Julia', email: 'test@example.invalid', status: 'ACTIVE', hourlyPayRate: new Prisma.Decimal(30) };
  const location = { id: 'sha', name: 'Sha Patisserie' };
  let shifts = ['a', 'b'].map((id) => ({
    id, userId: user.id, user, locationId: location.id, location,
    startTime: new Date('2020-10-05T01:00:00Z'), endTime: new Date('2020-10-05T05:00:00Z'),
    publishedAt: new Date('2020-10-01'), breakMinutes: 0, startBreak: null, endBreak: null,
  }));
  let logs = [{
    id: 'log', userId: user.id, user, locationId: location.id, location,
    clockIn: new Date('2020-10-05T01:00:00Z'), clockOut: new Date('2020-10-05T05:00:00Z'),
    timesheetId: null,
  }];
  let sheets = [];
  let audits = [];
  const db = {
    leaveRequest: { findMany: async () => [] },
    location: { findMany: async () => [location] },
    shift: { findMany: async ({ where }) => shifts.filter((shift) =>
      where.OR ? where.OR.some((condition) =>
        (condition.publishedAt && shift.publishedAt) ||
        (condition.startBreak && shift.startBreak) ||
        (condition.endBreak && shift.endBreak)) : Boolean(shift.publishedAt)) },
    timeLog: {
      findMany: async () => logs,
      updateMany: async ({ where, data }) => {
        let count = 0;
        logs = logs.map((log) => {
          if (!where.id.in.includes(log.id) ||
              !where.OR.some((condition) => condition.timesheetId === log.timesheetId)) return log;
          count++;
          return { ...log, ...data };
        });
        return { count };
      },
    },
    timesheet: {
      findMany: async ({ where }) => {
        if (where.status) return sheets.filter((sheet) => sheet.userId === where.userId &&
          sheet.status === where.status && sheet.sourceKey !== where.sourceKey.not);
        return sheets.map((sheet) => ({
          ...sheet, user, shift: shifts.find((shift) => shift.id === sheet.shiftId) ?? null,
          logs: logs.filter((log) => log.timesheetId === sheet.id),
          history: audits.filter((audit) => audit.timesheetId === sheet.id).map((audit) => ({
            ...audit, actor: { name: 'Manager' }, createdAt: new Date('2020-10-12'),
          })),
        }));
      },
      createMany: async ({ data }) => {
        sheets.push(...data.map((sheet) => ({ ...sheet, version: 1,
          rateAtApproval: sheet.rateAtApproval === null ? null : new Prisma.Decimal(sheet.rateAtApproval) })));
        return { count: data.length };
      },
    },
    $queryRaw: async (query) => {
      const data = JSON.parse(query.values[0]);
      if (query.text.includes('UPDATE "Timesheet"')) {
        return data.flatMap((item) => {
          const sheet = sheets.find((entry) => entry.sourceKey === item.sourceKey && entry.version === item.expectedVersion);
          if (!sheet) return [];
          Object.assign(sheet, item, {
            version: sheet.version + 1, approvedAt: item.approvedAt ? new Date(item.approvedAt) : null,
            rateAtApproval: item.rateAtApproval === null ? null : new Prisma.Decimal(item.rateAtApproval),
          });
          return [{ id: sheet.id, sourceKey: sheet.sourceKey }];
        });
      }
      assert.ok(query.text.includes('UPDATE "TimeLog"'));
      const updated = [];
      logs = logs.map((log) => {
        const item = data.find((entry) => entry.logId === log.id &&
          (log.timesheetId === null || log.timesheetId === entry.timesheetId));
        if (!item) return log;
        updated.push({ id: log.id });
        return { ...log, timesheetId: item.timesheetId };
      });
      return updated;
    },
    timesheetAudit: { createMany: async ({ data }) => { audits.push(...data); return { count: data.length }; } },
    $transaction: async (work, options) => {
      assert.equal(options.isolationLevel, 'Serializable');
      const before = { sheets: sheets.map((sheet) => ({ ...sheet })), logs: [...logs], audits: [...audits] };
      try { return await work(db); }
      catch (error) { sheets = before.sheets; logs = before.logs; audits = before.audits; throw error; }
    },
  };
  const load = Module._load;
  const reportPath = path.join(root, 'lib', 'timesheet-report.ts');
  const apiPath = path.join(root, 'app', 'api', 'admin', 'reports', 'timesheets', 'route.ts');
  delete require.cache[reportPath];
  delete require.cache[apiPath];
  Module._load = function (request, ...args) {
    if (request === '@/lib/prisma') return { prisma: db };
    if (request === '@/lib/session') return {
      getSession: async () => ({ userId: 'manager', role: 'MANAGER' }),
      isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role),
    };
    return load.call(this, request, ...args);
  };
  let report, api;
  try {
    report = require(reportPath).loadTimesheetReport;
    api = require(apiPath);
  } finally { Module._load = load; }
  const payload = (row, overrides = {}) => ({
    sourceKey: row.sourceKey, weekStart: '2020-10-05', version: row.version, snapshot: row.snapshot,
    action: 'APPROVE', periods: row.periods, breakMinutes: row.breakMinutes, reason: '', ...overrides,
  });
  return {
    load: () => report('2020-10-05', db),
    send: (body) => api.POST(new Request('http://localhost/api/admin/reports/timesheets', {
      method: 'POST', body: JSON.stringify(body),
    })),
    payload,
    get logs() { return logs; },
    get audits() { return audits; },
    removeOverlap() { shifts = shifts.slice(0, 1); },
    addOverlap() { shifts.push({ ...shifts[0], id: 'c' }); },
    finishLog(value) { logs = logs.map((log) => ({ ...log, clockOut: value })); },
    setSessionBreak(startBreak, endBreak) {
      logs = logs.map((log) => ({ ...log, startBreak, endBreak }));
    },
    removeRoster() { shifts = []; },
    setRosterPreset(minutes) { shifts = shifts.map((shift) => ({ ...shift, breakMinutes: minutes })); },
    setRosterDraft() { shifts = shifts.map((shift) => ({ ...shift, publishedAt: null })); },
    setLegacyBreak(startBreak, endBreak) { shifts = shifts.map((shift) => ({ ...shift, startBreak, endBreak })); },
    moveAttendance() { logs = logs.map((log) => ({ ...log, locationId: 'zb', location: { name: 'Zushi Bento' } })); },
    changeRate() { user.hourlyPayRate = null; },
    endEmployment() { user.status = 'INACTIVE'; },
  };
}

test('recorded breaks on unpublished roster shifts remain visible and linked to attendance but cannot be approved', async () => {
  const f = fixture();
  f.removeOverlap();
  f.setRosterDraft();
  f.setRosterPreset(30);
  f.setLegacyBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:21:00Z'));
  const report = await f.load();
  assert.equal(report.shifts.length, 1);
  const row = report.shifts[0];
  assert.equal(row.actual.length, 1);
  assert.equal(row.actualBreakMinutes, 21);
  assert.equal(row.breakMinutes, 21);
  assert.equal(row.recordedBreaks.length, 1);
  assert.ok(row.exceptions.includes('Roster shift unpublished'));
  assert.match(row.approvalBlockedReason, /Publish the roster/);
  assert.equal((await f.send(f.payload(row, { reason: 'Reviewed recorded break.' }))).status, 400);
  assert.equal(f.audits.length, 0);
  assert.deepEqual(report.rows, []);
});

test('unfinished legacy breaks on drafts stay visible and ordinary draft rosters stay excluded', async () => {
  const f = fixture();
  f.removeOverlap();
  f.setRosterDraft();
  let report = await f.load();
  assert.equal(report.shifts.length, 1);
  assert.equal(report.shifts[0].sourceKey, 'log:log');
  f.setLegacyBreak(new Date('2020-10-05T03:00:00Z'), null);
  report = await f.load();
  assert.equal(report.shifts[0].sourceKey, 'shift:a');
  assert.equal(report.shifts[0].actualBreakMinutes, null);
  assert.equal(report.shifts[0].inProgress, true);
  assert.equal(report.shifts[0].recordedBreaks.length, 1);
});

test('legacy draft breaks combine with attendance across venues without hiding roster overlaps', async () => {
  const f = fixture();
  f.setRosterDraft();
  f.setLegacyBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:30:00Z'));
  let report = await f.load();
  const attendance = report.shifts.find((row) => row.actual.length);
  assert.equal(attendance.sourceKey, 'log:log');
  assert.equal(attendance.ambiguous, true);
  f.removeOverlap();
  f.moveAttendance();
  report = await f.load();
  assert.equal(report.shifts.length, 1);
  assert.equal(report.shifts[0].sourceKey, 'shift:a');
  assert.equal(report.shifts[0].actual.length, 1);
  assert.equal(report.shifts[0].actualBreakMinutes, 30);
  assert.equal(report.shifts[0].recordedBreaks.length, 1);
  assert.equal(report.shifts[0].site, 'Sha Patisserie');
  assert.equal(f.logs[0].locationId, 'zb');
  assert.match(report.shifts[0].approvalBlockedReason, /Publish the roster/);
});

for (const legacy of [false, true]) {
  test(`different-venue ${legacy ? 'legacy' : 'session'} break stays on one roster row, deducts once and invalidates stale approval`, async () => {
    const f = fixture();
    f.removeOverlap();
    f.moveAttendance();
    f.setRosterPreset(30);
    const setBreak = legacy ? f.setLegacyBreak : f.setSessionBreak;
    setBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:27:00Z'));
    let report = await f.load();
    assert.equal(report.shifts.length, 1);
    let row = report.shifts[0];
    assert.equal(row.sourceKey, 'shift:a');
    assert.equal(row.actual.length, 1);
    assert.equal(row.actualBreakMinutes, 27);
    assert.equal(row.breakMinutes, 27);
    assert.equal(row.recordedBreaks.length, 1);
    assert.equal(row.site, 'Sha Patisserie');
    assert.equal((await f.send(f.payload(row))).status, 200);
    report = await f.load();
    assert.equal(report.rows.length, 1);
    assert.equal(report.rows[0].site, 'Sha Patisserie');
    assert.equal(report.rows[0].totalHours, 3.55);
    assert.equal(f.logs[0].locationId, 'zb');
    assert.equal(f.logs[0].timesheetId, f.audits[0].timesheetId);
    setBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:35:00Z'));
    report = await f.load();
    row = report.shifts[0];
    assert.equal(row.actualBreakMinutes, 35);
    assert.equal(row.sourceChanged, true);
    assert.equal(report.rows.length, 0);
  });
}

test('overlapping rosters across venues are flagged rather than preferring the clock-in venue', async () => {
  const f = fixture();
  f.moveAttendance();
  const report = await f.load();
  const attendance = report.shifts.find((row) => row.actual.length);
  assert.equal(attendance.sourceKey, 'log:log');
  assert.equal(attendance.ambiguous, true);
  assert.equal(report.shifts.reduce((count, row) => count + row.actual.length, 0), 1);
  assert.equal((await f.send(f.payload(attendance))).status, 400);
});
test('ending employment retains approved historical hours, rate, source and payroll total', async () => {
  const f = fixture();
  f.removeOverlap();
  const before = await f.load();
  const row = before.shifts.find((entry) => entry.sourceKey === 'shift:a');
  assert.equal((await f.send(f.payload(row))).status, 200);
  const approved = await f.load();
  assert.equal(approved.rows[0].totalHours, 4);
  assert.equal(approved.rows[0].gross, 120);
  f.endEmployment();
  const inactive = await f.load();
  assert.deepEqual(inactive.rows, approved.rows);
  assert.equal(inactive.approvedCount, approved.approvedCount);
  assert.equal(inactive.shifts.find((entry) => entry.sourceKey === row.sourceKey).sourceChanged, false);
  assert.equal(f.logs.length, 1);
  assert.equal(f.audits.length, 1);
});

for (const scheduled of [false, true]) {
  test(`session breaks reach ${scheduled ? 'scheduled' : 'unscheduled'} payroll once and changed timestamps invalidate approval`, async () => {
    const f = fixture();
    if (scheduled) { f.removeOverlap(); f.setRosterPreset(30); }
    else f.removeRoster();
    f.setSessionBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:30:00Z'));
    let report = await f.load();
    let row = report.shifts.find((entry) => entry.actual.length);
    assert.equal(row.actualBreakMinutes, 30);
    assert.equal(row.breakMinutes, 30);
    assert.deepEqual(row.recordedBreaks, [{ start: '2020-10-05T03:00:00.000Z', end: '2020-10-05T03:30:00.000Z' }]);
    assert.equal((await f.send(f.payload(row, { reason: 'Reviewed actual attendance and recorded session break.' }))).status, 200);
    report = await f.load();
    assert.equal(report.rows[0].totalHours, 3.5);
    assert.equal(report.rows[0].gross, 105);
    f.setSessionBreak(new Date('2020-10-05T03:00:00Z'), new Date('2020-10-05T03:40:00Z'));
    report = await f.load();
    row = report.shifts.find((entry) => entry.actual.length);
    assert.equal(row.sourceChanged, true);
    assert.equal(row.actualBreakMinutes, 40);
    assert.equal(report.rows.length, 0);
  });
}

test('unfinished attendance-session breaks remain visible for payroll review', async () => {
  const f = fixture();
  f.removeRoster();
  f.setSessionBreak(new Date('2020-10-05T03:00:00Z'), null);
  const report = await f.load();
  const row = report.shifts.find((entry) => entry.actual.length);
  assert.equal(row.inProgress, true);
  assert.match(row.exceptions.join(' '), /unfinished/);
  assert.equal(row.actualBreakMinutes, null);
  assert.deepEqual(row.recordedBreaks, [{ start: '2020-10-05T03:00:00.000Z', end: null }]);
});

test('explained overlap approval reaches payroll once, retains rate and audit, and can be reopened', async () => {
  const f = fixture();
  let report = await f.load();
  const row = report.shifts.find((entry) => entry.sourceKey === 'log:log');
  assert.equal(row.ambiguous, true);
  assert.match(row.exceptions.join(' '), /overlaps roster shifts/);
  assert.equal(report.shifts.reduce((sum, entry) => sum + entry.actual.length, 0), 1);
  const missingReason = await f.send(f.payload(row));
  assert.equal(missingReason.status, 400);
  assert.match((await missingReason.json()).error, /Explain/);
  assert.equal(f.audits.length, 0);
  assert.equal((await f.send(f.payload(row, { reason: 'Duplicate roster entries; allocate all attendance to this review.' }))).status, 200);
  report = await f.load();
  assert.equal(report.rows.length, 1);
  assert.equal(report.rows[0].totalHours, 4);
  assert.equal(report.rows[0].gross, 120);
  assert.equal(f.logs[0].timesheetId, f.audits[0].timesheetId);
  assert.equal(f.audits[0].action, 'APPROVE');
  assert.match(f.audits[0].values.reason, /Duplicate roster/);
  assert.equal(f.logs[0].clockOut.toISOString(), '2020-10-05T05:00:00.000Z');
  f.changeRate();
  assert.equal((await f.load()).rows[0].gross, 120);
  const approved = report.shifts.find((entry) => entry.sourceKey === row.sourceKey);
  assert.equal((await f.send(f.payload(approved, { action: 'REOPEN', reason: 'Correct allocation.' }))).status, 200);
  assert.equal((await f.load()).rows.length, 0);
  assert.equal(f.audits.length, 2);
});

test('duplicate payable hours are rejected across roster rows and within a batch', async () => {
  for (const batch of [false, true]) {
    const f = fixture();
    const report = await f.load();
    const attendance = report.shifts.find((row) => row.sourceKey === 'log:log');
    const shift = report.shifts.find((row) => row.sourceKey === 'shift:a');
    const first = f.payload(attendance, { reason: 'Reviewed overlapping roster.' });
    const duplicate = f.payload(shift, { periods: attendance.periods, reason: 'Manual allocation.' });
    if (batch) {
      const result = await f.send({ batch: [first, duplicate] });
      assert.equal(result.status, 400);
      assert.match((await result.json()).error, /overlap another approved timesheet/);
      assert.equal((await f.load()).rows.length, 0);
      assert.equal(f.logs[0].timesheetId, null);
      assert.equal(f.audits.length, 0);
    } else {
      assert.equal((await f.send(first)).status, 200);
      const result = await f.send(duplicate);
      assert.equal(result.status, 400);
      assert.match((await result.json()).error, /overlap another approved timesheet/);
      assert.equal((await f.load()).rows[0].totalHours, 4);
    }
  }
});

test('changed overlap or attendance invalidates approval and stale browser snapshots', async () => {
  const f = fixture();
  const row = (await f.load()).shifts.find((entry) => entry.sourceKey === 'log:log');
  f.removeOverlap();
  assert.equal((await f.send(f.payload(row, { reason: 'Stale overlap review.' }))).status, 404);
  const current = (await f.load()).shifts.find((entry) => entry.actual.length);
  assert.equal((await f.send(f.payload(current, { reason: 'Verified attendance.' }))).status, 200);
  assert.equal((await f.load()).rows.length, 1);
  f.addOverlap();
  assert.equal((await f.load()).rows.length, 0);
  f.finishLog(new Date('2020-10-05T06:00:00Z'));
  assert.equal((await f.load()).rows.length, 0);
});

test('past unfinished attendance with explicit hours and a reason stays payable after approval', async () => {
  const f = fixture();
  f.finishLog(null);
  const row = (await f.load()).shifts.find((entry) => entry.sourceKey === 'log:log');
  assert.equal(row.inProgress, true);
  assert.equal((await f.send(f.payload(row, {
    periods: [{ start: '2020-10-05T01:00:00Z', end: '2020-10-05T05:00:00Z' }],
    reason: 'Manager verified finish time after forgotten clock-out.',
  }))).status, 200);
  assert.equal((await f.load()).rows[0].totalHours, 4);
  assert.equal(f.logs[0].clockOut, null);
});
