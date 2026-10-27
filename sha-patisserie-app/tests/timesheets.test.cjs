/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required for this isolated TypeScript loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Use the project's installed TypeScript compiler instead of adding a second
// test framework. The hook exists only in this isolated Node test process.
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(result.outputText, filename);
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
const rules = require('../lib/timesheets.ts');
const { candidateShifts } = require('../lib/attendance-matching.ts');
const { leavePeriod } = require('../lib/leave.ts');

test('leave periods include both endpoints and validate reversed, invalid and overlong ranges', () => {
  assert.equal(leavePeriod('2026-10-19', '2026-10-19').length, 1);
  assert.deepEqual(leavePeriod('2026-10-30', '2026-11-02').map((date) => date.toISOString().slice(0, 10)),
    ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
  for (const pair of [['2026-10-20', '2026-10-19'], ['2026-02-30', '2026-03-02'], ['2026-10-01', '2026-11-02'], ['', '']]) {
    assert.throws(() => leavePeriod(...pair));
  }
});
const period = (start, end) => ({ start: `2026-10-05T${start}:00+08:00`, end: `2026-10-05T${end}:00+08:00` });

test('leave workflow enforces eligibility, balances, review permissions and one-time deductions', async () => {
  const { Prisma } = require('@prisma/client');
  let session = { userId: 'staff', role: 'STAFF' };
  let existing = null;
  const person = { id: 'staff', name: 'Test', employmentType: 'PART_TIME', annualLeaveHours: new Prisma.Decimal(15), personalLeaveHours: new Prisma.Decimal(7.5) };
  const leave = { id: 'request', userId: 'staff', type: 'ANNUAL', hours: new Prisma.Decimal(7.5), status: 'PENDING', user: person };
  let deductions = 0;
  let created = [];
  let grouped = [];
  let staffFilter;
  let requestFilter;
  const tx = {
    user: {
      findMany: async ({ where }) => { staffFilter = where; return [person]; },
      findUnique: async () => person,
      updateMany: async ({ where, data }) => {
        const field = Object.keys(data)[0];
        if (person[field].lt(where[field].gte)) return { count: 0 };
        person[field] = person[field].minus(data[field].decrement);
        deductions++;
        return { count: 1 };
      },
    },
    leaveRequest: {
      findMany: async ({ where }) => { requestFilter = where; return grouped; },
      findFirst: async () => existing,
      findUnique: async () => leave,
      createMany: async ({ data }) => { created = data; return { count: data.length }; },
      update: async ({ data }) => Object.assign(leave, data),
      updateMany: async ({ data }) => { grouped.forEach((entry) => Object.assign(entry, data)); return { count: grouped.length }; },
    },
  };
  const load = Module._load;
  const filename = path.join(root, 'app/api/leave/route.ts');
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    if (request === '@/lib/session') return { getSession: async () => session, isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role) };
    if (request === '@/lib/prisma') return { prisma: { ...tx, $transaction: async (callback) => callback(tx) } };
    return load.call(this, request, ...args);
  };
  let route;
  try { route = require(filename); } finally { Module._load = load; delete require.cache[filename]; }
  const request = (method, body) => new Request('http://localhost/api/leave', {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const payload = { dates: ['2026-10-19', '2026-10-20'], type: 'ANNUAL', hours: 7.5 };
  assert.equal((await route.POST(request('POST', payload))).status, 201);
  assert.equal(created.length, 2);
  assert.equal(created[0].userId, 'staff');
  assert.equal((await route.POST(request('POST', { ...payload, dates: ['2026-02-30'] }))).status, 400);
  assert.equal((await route.POST(request('POST', { ...payload, hours: -1 }))).status, 400);
  assert.equal((await route.POST(request('POST', { ...payload, dates: ['2026-10-19', '2026-10-19'] }))).status, 400);
  person.employmentType = 'CASUAL';
  assert.equal((await route.POST(request('POST', payload))).status, 400);
  assert.equal((await route.POST(request('POST', { ...payload, type: 'UNPAID' }))).status, 201);
  person.employmentType = 'PART_TIME';
  existing = { id: 'already-requested' };
  assert.equal((await route.POST(request('POST', payload))).status, 409);
  existing = null;
  const approval = { id: 'request', status: 'APPROVED' };
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 403);
  session = { userId: 'staff', role: 'ADMIN' };
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 403);
  session = { userId: 'manager', role: 'MANAGER' };
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 200);
  assert.equal(person.annualLeaveHours.toNumber(), 7.5);
  assert.equal(deductions, 1);
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 409);
  assert.equal(deductions, 1);
  leave.status = 'PENDING'; leave.hours = new Prisma.Decimal(20);
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 409);
  assert.equal(deductions, 1);
  assert.equal((await route.PATCH(request('PATCH', { id: 'request', status: 'REJECTED' }))).status, 200);
  assert.equal(deductions, 1);

  const range = { startDate: '2026-10-19', endDate: '2026-10-20', type: 'ANNUAL', hours: 7.5, userId: 'someone-else' };
  session = { userId: 'staff', role: 'STAFF' };
  assert.equal((await route.POST(request('POST', range))).status, 201);
  assert.equal(created.length, 2);
  assert.ok(created[0].requestGroupId);
  assert.equal(created[0].requestGroupId, created[1].requestGroupId);
  assert.equal(created[0].userId, 'staff');
  assert.equal((await route.POST(request('POST', { ...range, endDate: '2026-10-18' }))).status, 400);
  assert.equal((await route.GET(new Request('http://localhost/api/leave?view=review'))).status, 403);
  assert.equal((await route.GET(new Request('http://localhost/api/leave'))).status, 200);
  assert.deepEqual(staffFilter, { id: 'staff' });
  assert.deepEqual(requestFilter, { userId: 'staff' });
  session = { userId: 'manager', role: 'MANAGER' };
  await route.GET(new Request('http://localhost/api/leave'));
  assert.deepEqual(staffFilter, { id: 'manager' });
  await route.GET(new Request('http://localhost/api/leave?view=review'));
  assert.deepEqual(requestFilter, {});
  leave.status = 'PENDING'; leave.hours = new Prisma.Decimal(7.5); leave.requestGroupId = 'period';
  grouped = [leave, { ...leave, id: 'second-day' }];
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 409);
  assert.equal(deductions, 1);
  person.annualLeaveHours = new Prisma.Decimal(15);
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 200);
  assert.equal(person.annualLeaveHours.toNumber(), 0);
  assert.equal(deductions, 2);
  assert.ok(grouped.every((entry) => entry.status === 'APPROVED'));
  assert.equal((await route.PATCH(request('PATCH', approval))).status, 409);
  assert.equal(deductions, 2);
});

test('Perth inputs preserve the date, offset and seconds independently of browser timezone', () => {
  assert.equal(rules.perthDate('2026-10-04T17:00:00Z'), '2026-10-05');
  assert.equal(rules.inputTimestamp('2026-10-05T09:12:37'), '2026-10-05T01:12:37.000Z');
  assert.equal(rules.localInput('2026-10-05T01:12:37.000Z'), '2026-10-05T09:12:37');
  assert.equal(rules.inputTimestamp(''), '');
});

test('week selection rejects non-Mondays and impossible dates', () => {
  assert.equal(rules.weekBounds('2026-10-05').start.toISOString(), '2026-10-04T16:00:00.000Z');
  for (const value of ['', '2026-10-06', '2026-02-30', '2026-13-01']) {
    assert.throws(() => rules.weekBounds(value));
  }
});

test('time-only editor defaults to attendance minutes and preserves unedited timestamps', () => {
  const original = { start: '2026-10-05T01:12:37.000Z', end: '2026-10-05T09:08:42.123Z' };
  assert.equal(rules.timeInput(original.start), '09:12');
  assert.equal(rules.timeInput(original.end), '17:08');
  const edited = rules.editPeriodTime(original, 'start', '09:15', '2026-10-05');
  assert.equal(edited.start, '2026-10-05T01:15:00.000Z');
  assert.equal(edited.end, original.end);
  assert.deepEqual(rules.editPeriodTime(original, 'end', '', '2026-10-05'), { ...original, end: '' });
  assert.throws(() => rules.editPeriodTime(original, 'start', '25:30', '2026-10-05'));
  assert.equal(original.start, '2026-10-05T01:12:37.000Z');
});

test('time-only editor uses the work date and handles overnight and next-day periods', () => {
  let edited = rules.editPeriodTime({ start: '', end: '' }, 'start', '22:00', '2026-10-05');
  edited = rules.editPeriodTime(edited, 'end', '06:00', '2026-10-05');
  assert.equal(edited.start, '2026-10-05T14:00:00.000Z');
  assert.equal(edited.end, '2026-10-05T22:00:00.000Z');
  rules.validatePayable([edited], 0, '2026-10-05');
  assert.equal(rules.paidHours([edited], 0), 8);
  edited = rules.editPeriodTime(edited, 'start', '05:00', '2026-10-05');
  assert.equal(rules.perthDate(edited.end), '2026-10-05');
  assert.equal(rules.paidHours([edited], 0), 1);
  const nextDay = { start: '2026-10-05T18:00:00Z', end: '2026-10-05T22:00:00Z' };
  const changed = rules.editPeriodTime(nextDay, 'end', '07:00', '2026-10-05');
  assert.equal(rules.perthDate(changed.start), '2026-10-06');
  assert.equal(rules.perthDate(changed.end), '2026-10-06');
  assert.equal(rules.timeInput(changed.end), '07:00');
  let endFirst = rules.editPeriodTime({ start: '', end: '' }, 'end', '06:00', '2026-10-05');
  endFirst = rules.editPeriodTime(endFirst, 'start', '22:00', '2026-10-05');
  assert.equal(rules.paidHours([endFirst], 0), 8);
});

test('paid hours subtract recorded breaks without rounding attendance', () => {
  assert.equal(rules.paidHours([period('09:12', '17:00')], 30), 7.3);
  assert.equal(rules.paidHours([period('09:00', '12:00'), period('13:00', '17:00')], 0), 7);
  assert.equal(rules.paidHours([], 0), 0);
  assert.equal(rules.paidHours([{ start: '2026-10-05T01:00:00Z', end: '2026-10-05T01:00:30Z' }], 0), 1 / 120);
  assert.equal(rules.recordedBreakMinutes(new Date('2026-10-05T04:00:00Z'), new Date('2026-10-05T04:30:00Z')), 30);
  assert.equal(rules.recordedBreakMinutes(null, null), null);
  assert.equal(rules.recordedBreakMinutes(new Date('2026-10-05T04:00:00Z'), null), null);
});

test('payable validation rejects overlap, reversed periods, bad breaks and remote dates', () => {
  rules.validatePayable([period('09:00', '12:00'), period('12:00', '17:00')], 30, '2026-10-05');
  rules.validatePayable([{ start: '2026-10-05T22:00:00+08:00', end: '2026-10-06T06:00:00+08:00' }], 30, '2026-10-05');
  rules.validatePayable([], 0, '2026-10-05');
  for (const [periods, deduction] of [
    [[period('09:00', '12:00'), period('11:00', '17:00')], 0],
    [[period('17:00', '09:00')], 0], [[period('09:00', '10:00')], 61],
    [[period('09:00', '10:00')], -1], [[period('09:00', '10:00')], 0.5],
    [[{ start: '2026-10-05T09:00:00', end: '2026-10-05T10:00:00' }], 0],
    [[{ start: '2026-11-05T09:00:00Z', end: '2026-11-05T10:00:00Z' }], 0],
    [[], 30],
  ]) assert.throws(() => rules.validatePayable(periods, deduction, '2026-10-05'));
});

test('matching requires staff, venue and overlap; ambiguous matches are not guessed', () => {
  const shift = { id: 'a', userId: 'u', locationId: 'sha', startTime: new Date('2026-10-05T01:00Z'), endTime: new Date('2026-10-05T09:00Z') };
  const log = { userId: 'u', locationId: 'sha', clockIn: new Date('2026-10-05T01:12Z'), clockOut: new Date('2026-10-05T09:08Z') };
  const now = new Date('2026-10-12');
  assert.equal(candidateShifts(log, [shift], now).length, 1);
  assert.equal(candidateShifts({ ...log, locationId: 'zb' }, [shift], now).length, 0);
  assert.equal(candidateShifts({ ...log, userId: 'other' }, [shift], now).length, 0);
  assert.equal(candidateShifts({ ...log, clockIn: shift.endTime }, [shift], now).length, 0);
  assert.equal(candidateShifts(log, [shift, { ...shift, id: 'b' }], now).length, 2);
});

test('live attendance uses the Perth work date, not just a missing clock-out', () => {
  const today = '2026-10-27';
  assert.equal(rules.isLiveAttendance({ inProgress: true, workDate: '2026-10-26' }, today), false);
  assert.equal(rules.isLiveAttendance({ inProgress: true, workDate: today }, today), true);
  assert.equal(rules.isLiveAttendance({ inProgress: true, workDate: '2026-10-28' }, today), true);
  assert.equal(rules.isLiveAttendance({ inProgress: false, workDate: today }, today), false);
});

test('approval allows explained roster overlaps but blocks current open attendance, future hours and missing rates', () => {
  const row = { inProgress: false, ambiguous: false, rate: 30, scheduledEnd: null, actual: [], workDate: rules.perthDate(new Date()) };
  assert.equal(rules.approvalError(row, [period('09:00', '17:00')]), null);
  assert.equal(rules.approvalError({ ...row, ambiguous: true }, []), null);
  assert.equal(rules.approvalError({ ...row, inProgress: true, workDate: '2020-01-01' }, []), null);
  for (const change of [{ inProgress: true }, { rate: null }, { rate: -1 }]) {
    assert.ok(rules.approvalError({ ...row, ...change }, []));
  }
  assert.ok(rules.approvalError(row, [{ start: '2099-10-05T01:00:00Z', end: '2099-10-05T09:00:00Z' }]));
});

test('adjustments, missing attendance and unscheduled work require explanations', () => {
  const actual = [{ id: 'a', clockIn: '2026-10-05T01:00:00Z', clockOut: '2026-10-05T09:00:00Z' }];
  const row = { scheduledStart: actual[0].clockIn, actual, actualBreakMinutes: 30, sourceChanged: false };
  assert.equal(rules.requiresReason(row, rules.actualPeriods(actual), 30), false);
  assert.equal(rules.requiresReason({ ...row, ambiguous: true }, rules.actualPeriods(actual), 30), true);
  assert.equal(rules.requiresReason({ ...row, inProgress: true }, rules.actualPeriods(actual), 30), true);
  assert.equal(rules.requiresReason(row, [period('09:00', '16:00')], 30), true);
  assert.equal(rules.requiresReason({ ...row, actual: [] }, [], 0), true);
  assert.equal(rules.requiresReason({ ...row, scheduledStart: null }, rules.actualPeriods(actual), 30), true);
  assert.equal(rules.requiresReason(row, rules.actualPeriods(actual), 0), true);
});

test('CSV quotes delimiters and prevents spreadsheet formulas', () => {
  assert.equal(rules.csvCell('A "B", C'), '"A ""B"", C"');
  assert.equal(rules.csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
});

test('database-backed save, approve, reopen and payroll workflow', {
  skip: process.env.RUN_TIMESHEET_DB_TESTS !== 'true',
  timeout: 240000,
}, async () => {
  require('@next/env').loadEnvConfig(root);
  const { PrismaClient, Prisma } = require('@prisma/client');
  const client = new PrismaClient();
  const rollback = new Error('Intentional test rollback');
  let assertionsCompleted = false;
  try {
    await client.$transaction(async (tx) => {
      // Fixture data and every review action live in one transaction that is
      // intentionally rolled back. Existing attendance/payroll is never edited.
      const token = `timesheet-test-${Date.now()}`;
      const user = await tx.user.create({ data: { email: `${token}@example.invalid`, name: token, pinCode: 'test-only', role: 'ADMIN', status: 'ACTIVE', hourlyPayRate: 30 } });
      const location = await tx.location.create({ data: { name: token, code: token } });
      const shift = await tx.shift.create({ data: {
        userId: user.id, locationId: location.id, startTime: new Date('2026-10-05T01:00:00Z'),
        endTime: new Date('2026-10-05T09:00:00Z'), publishedAt: new Date(), breakMinutes: 60,
        startBreak: new Date('2026-10-05T04:00:00Z'), endBreak: new Date('2026-10-05T04:30:00Z'),
      } });
      const log = await tx.timeLog.create({ data: {
        userId: user.id, locationId: location.id, clockIn: new Date('2026-10-05T01:12:00Z'), clockOut: new Date('2026-10-05T09:08:00Z'),
      } });
      let session = { userId: user.id, role: 'ADMIN' };
      const cacheModule = (filename, exports) => {
        const loadedModule = new Module(filename);
        loadedModule.exports = exports; loadedModule.loaded = true; require.cache[filename] = loadedModule;
      };
      cacheModule(path.join(root, 'lib', 'prisma.ts'), { prisma: { $transaction: (work) => work(tx) } });
      cacheModule(path.join(root, 'lib', 'session.ts'), {
        getSession: async () => session, isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role),
      });
      const { loadTimesheetReport } = require('../lib/timesheet-report.ts');
      const { POST } = require('../app/api/admin/reports/timesheets/route.ts');
      const load = () => loadTimesheetReport('2026-10-05', tx);
      const getRow = async (key = `shift:${shift.id}`) => (await load()).shifts.find((row) => row.sourceKey === key);
      const send = (row, action, overrides = {}) => POST(new Request('http://localhost/api/admin/reports/timesheets', {
        method: 'POST', body: JSON.stringify({
          sourceKey: row.sourceKey, weekStart: '2026-10-05', version: row.version, snapshot: row.snapshot,
          action, periods: row.periods, breakMinutes: row.breakMinutes, reason: row.reason, ...overrides,
        }),
      }));
      const initial = await getRow();
      assert.equal(initial.actual[0].clockIn, log.clockIn.toISOString());
      assert.equal(initial.periods[0].start, log.clockIn.toISOString());
      assert.equal(initial.actualBreakMinutes, 30);
      assert.equal(initial.breakMinutes, 30);
      assert.equal((await load()).rows.some((row) => row.userId === user.id), false);

      session = { ...session, role: 'STAFF' };
      assert.equal((await send(initial, 'SAVE')).status, 403);
      session = { ...session, role: 'ADMIN' };
      assert.equal((await send(initial, 'SAVE', { periods: [period('09:12', '17:00')] })).status, 400);
      assert.equal((await send(initial, 'SAVE', { periods: [period('09:12', '17:00')], reason: 'Scheduled duties finished at 5pm.' })).status, 200);
      assert.equal((await send(initial, 'APPROVE')).status, 409);
      let row = await getRow();
      assert.equal(row.status, 'PENDING');
      assert.equal((await load()).rows.some((entry) => entry.userId === user.id), false);
      assert.equal((await send(row, 'APPROVE')).status, 200);
      row = await getRow();
      assert.equal(row.status, 'APPROVED');
      assert.equal(row.history.length, 2);
      const payroll = (await load()).rows.find((entry) => entry.userId === user.id);
      assert.equal(payroll.totalHours, 7.3);
      assert.equal(payroll.gross, 219);
      assert.equal((await send(row, 'SAVE')).status, 409);
      assert.equal((await send(row, 'REOPEN', { reason: '' })).status, 400);
      assert.equal((await tx.timeLog.findUnique({ where: { id: log.id } })).clockOut.toISOString(), log.clockOut.toISOString());

      // A break update invalidates the approval without rewriting its history.
      await tx.shift.update({ where: { id: shift.id }, data: { endBreak: new Date('2026-10-05T04:40:00Z') } });
      row = await getRow();
      assert.equal(row.sourceChanged, true);
      assert.equal((await load()).rows.some((entry) => entry.userId === user.id), false);
      assert.equal((await send(row, 'REOPEN', { reason: 'Review updated break.' })).status, 200);
      row = await getRow();
      assert.equal(row.status, 'PENDING');
      assert.equal(row.history.length, 3);
      assert.equal((await send(row, 'APPROVE', { breakMinutes: 40 })).status, 200);

      const extraLog = await tx.timeLog.create({ data: {
        userId: user.id, locationId: location.id,
        clockIn: new Date('2026-10-06T01:00:00Z'), clockOut: new Date('2026-10-06T03:00:00Z'),
      } });
      const unscheduled = await getRow(`log:${extraLog.id}`);
      assert.equal(unscheduled.scheduledStart, null);
      assert.equal((await send(unscheduled, 'APPROVE', {
        periods: [period('10:00', '11:00')], reason: 'Attempt overlapping payable hours.',
      })).status, 400);
      assert.equal((await send(unscheduled, 'APPROVE', { reason: 'Approved extra duties.' })).status, 200);
      assert.equal((await tx.timeLog.findUnique({ where: { id: extraLog.id } })).timesheetId !== null, true);
      // Staff rate changes must not retroactively change an approved payroll rate.
      await tx.user.update({ where: { id: user.id }, data: { hourlyPayRate: 40 } });
      const fixedRates = (await load()).rows.filter((entry) => entry.userId === user.id);
      assert.equal(fixedRates.every((entry) => entry.rate === 30), true);

      const overnight = await tx.shift.create({ data: {
        userId: user.id, locationId: location.id, startTime: new Date('2026-10-07T14:00:00Z'),
        endTime: new Date('2026-10-07T22:00:00Z'), publishedAt: new Date(),
      } });
      await tx.timeLog.createMany({ data: [
        { userId: user.id, locationId: location.id, clockIn: new Date('2026-10-07T14:00:00Z'), clockOut: new Date('2026-10-07T17:00:00Z') },
        { userId: user.id, locationId: location.id, clockIn: new Date('2026-10-07T18:00:00Z'), clockOut: new Date('2026-10-07T22:00:00Z') },
      ] });
      const overnightRow = await getRow(`shift:${overnight.id}`);
      assert.equal(overnightRow.workDate, '2026-10-07');
      assert.equal(overnightRow.actual.length, 2);
      assert.equal(rules.paidHours(overnightRow.periods, overnightRow.breakMinutes), 7);
      assert.equal((await send(overnightRow, 'APPROVE')).status, 200);
      const missing = await tx.shift.create({ data: {
        userId: user.id, locationId: location.id, startTime: new Date('2026-10-09T01:00:00Z'),
        endTime: new Date('2026-10-09T09:00:00Z'), publishedAt: new Date(), breakMinutes: 30,
      } });
      const missingRow = await getRow(`shift:${missing.id}`);
      assert.equal(missingRow.actual.length, 0);
      assert.equal(missingRow.periods.length, 0);
      assert.equal(missingRow.breakMinutes, 0);
      assert.equal((await send(missingRow, 'SAVE', { attendanceStatus: 'NO_SHOW', reason: 'Manager verified absence.' })).status, 200);
      const classified = await getRow(`shift:${missing.id}`);
      assert.equal(classified.attendanceStatus, 'NO_SHOW');
      assert.equal((await send(classified, 'APPROVE', { reason: 'Manager verified absence; zero pay.' })).status, 200);
      await tx.user.update({ where: { id: user.id }, data: { employmentType: 'PART_TIME', annualLeaveHours: 15 } });
      const reviewer = await tx.user.create({ data: { email: `${token}-reviewer@example.invalid`, name: 'Reviewer', pinCode: 'test-only', role: 'MANAGER' } });
      const leaveRoute = require('../app/api/leave/route.ts');
      session = { userId: user.id, role: 'STAFF' };
      const leaveRequest = (method, body) => new Request('http://localhost/api/leave', { method, body: JSON.stringify(body) });
      assert.equal((await leaveRoute.POST(leaveRequest('POST', { dates: ['2026-10-10'], type: 'ANNUAL', hours: 7.5 }))).status, 201);
      const requested = await tx.leaveRequest.findFirstOrThrow({ where: { userId: user.id } });
      const before = (await load()).rows.filter((entry) => entry.userId === user.id).reduce((sum, entry) => sum + entry.gross, 0);
      session = { userId: reviewer.id, role: 'MANAGER' };
      assert.equal((await leaveRoute.PATCH(leaveRequest('PATCH', { id: requested.id, status: 'APPROVED' }))).status, 200);
      assert.equal((await tx.user.findUniqueOrThrow({ where: { id: user.id } })).annualLeaveHours.toNumber(), 7.5);
      assert.equal((await leaveRoute.PATCH(leaveRequest('PATCH', { id: requested.id, status: 'APPROVED' }))).status, 409);
      const after = await load();
      const exportedLeave = after.leaveRows.find((entry) => entry.userId === user.id);
      assert.equal(exportedLeave.hours, 7.5);
      assert.equal(exportedLeave.employmentType, 'PART_TIME');
      assert.equal(after.rows.filter((entry) => entry.userId === user.id).reduce((sum, entry) => sum + entry.gross, 0), before);
      assertionsCompleted = true;
      throw rollback;
    }, { timeout: 220000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    await client.$disconnect();
  }
  assert.equal(assertionsCompleted, true);
});
