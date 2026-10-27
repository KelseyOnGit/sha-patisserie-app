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
  const user = { id: 'julia', name: 'Julia', email: 'test@example.invalid', hourlyPayRate: new Prisma.Decimal(30) };
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
  let sequence = 0;
  const db = {
    leaveRequest: { findMany: async () => [] },
    location: { findMany: async () => [location] },
    shift: { findMany: async () => shifts },
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
      create: async ({ data }) => {
        const sheet = { ...data, id: `sheet-${++sequence}`, version: 1,
          rateAtApproval: data.rateAtApproval === null ? null : new Prisma.Decimal(data.rateAtApproval) };
        sheets.push(sheet);
        return sheet;
      },
      findUniqueOrThrow: async ({ where }) => sheets.find((sheet) => sheet.sourceKey === where.sourceKey),
      updateMany: async ({ where, data }) => {
        const sheet = sheets.find((entry) => entry.id === where.id && entry.version === where.version);
        if (!sheet) return { count: 0 };
        Object.assign(sheet, data, {
          version: where.version + 1,
          rateAtApproval: data.rateAtApproval === null ? null : new Prisma.Decimal(data.rateAtApproval),
        });
        return { count: 1 };
      },
    },
    timesheetAudit: { create: async ({ data }) => { audits.push(data); return data; } },
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
    changeRate() { user.hourlyPayRate = null; },
  };
}

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
  assert.equal(f.logs[0].timesheetId, 'sheet-1');
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
