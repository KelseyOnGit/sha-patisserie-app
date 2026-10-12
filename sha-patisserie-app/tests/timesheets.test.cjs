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
const period = (start, end) => ({ start: `2026-10-05T${start}:00+08:00`, end: `2026-10-05T${end}:00+08:00` });

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

test('approval blocks open attendance, overlap, future hours and missing rates', () => {
  const row = { inProgress: false, ambiguous: false, rate: 30, scheduledEnd: null, actual: [] };
  assert.equal(rules.approvalError(row, [period('09:00', '17:00')]), null);
  for (const change of [{ inProgress: true }, { ambiguous: true }, { rate: null }, { rate: -1 }]) {
    assert.ok(rules.approvalError({ ...row, ...change }, []));
  }
  assert.ok(rules.approvalError(row, [{ start: '2099-10-05T01:00:00Z', end: '2099-10-05T09:00:00Z' }]));
});

test('adjustments, missing attendance and unscheduled work require explanations', () => {
  const actual = [{ id: 'a', clockIn: '2026-10-05T01:00:00Z', clockOut: '2026-10-05T09:00:00Z' }];
  const row = { scheduledStart: actual[0].clockIn, actual, actualBreakMinutes: 30, sourceChanged: false };
  assert.equal(rules.requiresReason(row, rules.actualPeriods(actual), 30), false);
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
      assert.equal((await send(missingRow, 'APPROVE', { reason: 'Manager verified absence; zero pay.' })).status, 200);
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
