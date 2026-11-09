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

test('weekly report launches independent reads together and limits matching to employee shifts without losing rows', async () => {
  const shifts = [];
  const logs = [];
  const venue = { name: 'Sha Patisserie' };
  for (let person = 0; person < 40; person++) {
    const user = { id: `user-${person}`, name: `Staff ${person}`, status: 'ACTIVE',
      employmentType: 'CASUAL', hourlyPayRate: new Prisma.Decimal(30) };
    for (let day = 5; day <= 11; day++) {
      const start = new Date(`2020-10-${String(day).padStart(2, '0')}T01:00:00Z`);
      const end = new Date(start.getTime() + 6 * 3600000);
      shifts.push({ id: `${person}-${day}`, userId: user.id, user, locationId: 'sha', location: venue,
        startTime: start, endTime: end, breakMinutes: 0, publishedAt: new Date('2020-10-01') });
      logs.push({ id: `log-${person}-${day}`, userId: user.id, user, locationId: 'sha', location: venue,
        clockIn: start, clockOut: end, timesheetId: null });
    }
  }
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const started = [];
  const read = (name, data, check = () => {}) => async (query) => {
    check(query);
    started.push(name);
    await gate;
    return data;
  };
  const checkUser = (select) => {
    assert.deepEqual(Object.keys(select).sort(),
      ['id', 'name', 'email', 'status', 'employmentType', 'hourlyPayRate'].sort());
    assert.equal(select.pinCode, undefined);
  };
  const db = {
    leaveRequest: { findMany: read('leave', []) },
    timesheet: { findMany: read('saved', [], ({ include }) => {
      checkUser(include.user.select);
      checkUser(include.shift.select.user.select);
      checkUser(include.logs.select.user.select);
    }) },
    timeLog: { findMany: read('logs', logs, ({ select }) => {
      checkUser(select.user.select);
      assert.equal(select.lat, undefined);
      assert.equal(select.lng, undefined);
    }) },
    location: { findMany: read('locations', [venue]) },
    shift: { findMany: async ({ select }) => {
      checkUser(select.user.select);
      assert.equal(select.shiftReport, undefined);
      return shifts;
    } },
  };
  const { candidateShifts } = require('../lib/attendance-matching.ts');
  let comparisons = 0;
  const load = Module._load;
  const filename = path.join(root, 'lib', 'timesheet-report.ts');
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    if (request === '@/lib/prisma') return { prisma: db };
    if (request === '@/lib/attendance-matching') return {
      candidateShifts(log, candidates, now) {
        assert.ok(candidates.every((shift) => shift.userId === log.userId));
        comparisons += candidates.length;
        return candidateShifts(log, candidates, now);
      },
    };
    return load.call(this, request, ...args);
  };
  let report;
  try { report = require(filename).loadTimesheetReport; }
  finally { Module._load = load; delete require.cache[filename]; }
  const pending = report('2020-10-05', db);
  const readsAtStart = [...started];
  release();
  const result = await pending;
  assert.deepEqual(readsAtStart.sort(), ['leave', 'locations', 'logs', 'saved']);
  assert.equal(result.shifts.length, 280);
  assert.equal(result.shifts.reduce((sum, row) => sum + row.actual.length, 0), 280);
  assert.ok(result.shifts.every((row) => !row.ambiguous && row.periods.length === 1));
  assert.equal(comparisons, 1960);
  assert.equal(logs.length * shifts.length, 78400);
  assert.equal(result.excludedCount, 280);
  assert.deepEqual(result.rows, []);
});

const rules = require('../lib/timesheets.ts');
const payableRow = (index = 0) => ({
  sourceKey: `shift:${index}`, userId: `staff-${index}`, staffName: `Staff ${index}`,
  workDate: '2020-10-05', site: 'Sha Patisserie', attendanceStatus: 'WORKED',
  scheduledStart: '2020-10-05T01:00:00Z', scheduledEnd: '2020-10-05T09:00:00Z',
  actual: [], periods: [{ start: '2020-10-05T01:00:00Z', end: '2020-10-05T09:00:00Z' }],
  breakMinutes: 0, actualBreakMinutes: null, version: 0, snapshot: 'snapshot',
  status: 'PENDING', sourceChanged: false, inProgress: false, ambiguous: false,
  exceptions: [], approvalBlockedReason: null, rate: 30, reason: 'Verified work',
});

test('bulk approval preserves split periods and seconds unless net hours are explicitly changed', () => {
  const row = { ...payableRow(), breakMinutes: 15, periods: [
    { start: '2020-10-05T01:12:34Z', end: '2020-10-05T04:00:11Z' },
    { start: '2020-10-05T05:00:01Z', end: '2020-10-05T09:00:17Z' },
  ] };
  assert.deepEqual(rules.adjustedPayable(row), { periods: row.periods, breakMinutes: 15 });
  assert.deepEqual(rules.adjustedPayable(row, rules.paidHours(row.periods, 15)),
    { periods: row.periods, breakMinutes: 15 });
  for (const hours of [6.75, 8, 0.01]) {
    const result = rules.adjustedPayable(row, hours);
    assert.ok(Math.abs(rules.paidHours(result.periods, result.breakMinutes) - hours) < 1e-9);
    assert.equal(result.periods[0].start, row.periods[0].start);
    rules.validatePayable(result.periods, result.breakMinutes, row.workDate);
  }
  assert.deepEqual(rules.adjustedPayable(row, 0), { periods: [], breakMinutes: 0 });
  for (const hours of [NaN, Infinity, -1, 25]) {
    assert.throws(() => rules.adjustedPayable(row, hours), /between 0 and 24/);
  }
});

function saveFixture(rows, options = {}) {
  let sheets = rows.filter((row) => row.version > 0).map((row) => ({
    id: `saved-${row.sourceKey}`, sourceKey: row.sourceKey, version: row.version,
  }));
  let audits = [];
  let allocations = [];
  let attempts = 0;
  let reads = 0;
  let writes = 0;
  const knownError = (code) => new Prisma.PrismaClientKnownRequestError('Simulated database failure', {
    code, clientVersion: 'test',
  });
  const db = {
    timesheet: {
      createMany: async ({ data }) => {
        writes++;
        sheets.push(...data);
        return { count: data.length };
      },
      update: async ({ where, data }) => {
        writes++;
        const sheet = sheets.find((entry) => entry.sourceKey === where.sourceKey && entry.version === where.version);
        if (!sheet || options.staleUpdate) throw knownError('P2025');
        Object.assign(sheet, data, { version: sheet.version + 1 });
        return { id: sheet.id };
      },
    },
    timeLog: {
      updateMany: async ({ where, data }) => {
        writes++;
        assert.ok(sheets.some((sheet) => sheet.id === data.timesheetId));
        allocations.push({ where, data });
        return { count: options.allocationConflict ? 0 : where.id.in.length };
      },
    },
    timesheetAudit: {
      createMany: async ({ data }) => {
        writes++;
        audits.push(...data);
        if (options.auditFailure) throw knownError('P2028');
        return { count: data.length };
      },
    },
    $transaction: async (work, transactionOptions) => {
      attempts++;
      assert.equal(transactionOptions.isolationLevel, 'Serializable');
      assert.equal(transactionOptions.timeout, 25000);
      const before = { sheets: sheets.map((sheet) => ({ ...sheet })), audits: [...audits], allocations: [...allocations] };
      try {
        const result = await work(db);
        if (attempts <= (options.serializationFailures ?? 0)) throw knownError('P2034');
        return result;
      } catch (error) {
        ({ sheets, audits, allocations } = before);
        throw error;
      }
    },
  };
  const filename = path.join(root, 'app', 'api', 'admin', 'reports', 'timesheets', 'route.ts');
  delete require.cache[filename];
  const load = Module._load;
  Module._load = function (request, ...args) {
    if (request === '@/lib/prisma') return { prisma: db };
    if (request === '@/lib/session') return {
      getSession: async () => ({ userId: 'manager', role: 'MANAGER' }),
      isPrivilegedRole: (role) => role === 'MANAGER',
    };
    if (request === '@/lib/timesheet-report') return {
      loadTimesheetReport: async () => { reads++; return { shifts: rows }; },
      validateApproval: (row, periods) => {
        const error = rules.approvalError(row, periods);
        if (error) throw new Error(error);
      },
    };
    return load.call(this, request, ...args);
  };
  let api;
  try { api = require(filename); }
  finally { Module._load = load; delete require.cache[filename]; }
  const items = rows.map((row) => ({
    sourceKey: row.sourceKey, weekStart: '2020-10-05', version: row.version, snapshot: row.snapshot,
    action: 'APPROVE', periods: row.periods, breakMinutes: row.breakMinutes, reason: row.reason,
  }));
  return {
    items,
    send: (batch = items) => api.POST(new Request('http://localhost/api/admin/reports/timesheets', {
      method: 'POST', body: JSON.stringify({ batch }),
    })),
    get state() { return { sheets, audits, allocations, attempts, reads, writes }; },
  };
}

test('44 new manual timesheets commit with exactly two batched writes and aligned audits', async () => {
  const f = saveFixture(Array.from({ length: 44 }, (_, index) => payableRow(index)));
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 44);
  assert.equal(f.state.writes, 2);
  assert.equal(f.state.sheets.length, 44);
  assert.equal(new Set(f.state.sheets.map((sheet) => sheet.id)).size, 44);
  assert.equal(f.state.audits.length, 44);
  for (const sheet of f.state.sheets) {
    const audit = f.state.audits.find((entry) => entry.timesheetId === sheet.id);
    assert.equal(audit.actorId, 'manager');
    assert.equal(audit.action, 'APPROVE');
    assert.equal(audit.values.hours, 8);
    assert.deepEqual(audit.values.payablePeriods, sheet.payablePeriods);
  }
});

test('bulk approval allocates logs only after sheets exist and rolls back allocation failures', async () => {
  const row = { ...payableRow(), actual: [
    { id: 'log', clockIn: '2020-10-05T01:00:00Z', clockOut: '2020-10-05T09:00:00Z' },
  ] };
  const f = saveFixture([row]);
  assert.equal((await f.send()).status, 200);
  assert.equal(f.state.allocations.length, 1);
  assert.equal(f.state.allocations[0].data.timesheetId, f.state.sheets[0].id);
  const conflict = saveFixture([row], { allocationConflict: true });
  assert.equal((await conflict.send()).status, 409);
  assert.equal(conflict.state.sheets.length, 0);
  assert.equal(conflict.state.audits.length, 0);
  assert.equal(conflict.state.allocations.length, 0);
});

test('unchanged approvals cause no writes, changed sources are reapproved and stale updates conflict', async () => {
  const row = { ...payableRow(), version: 1, status: 'APPROVED' };
  const unchanged = saveFixture([row]);
  assert.equal((await unchanged.send()).status, 200);
  assert.equal(unchanged.state.writes, 0);
  const changed = saveFixture([{ ...row, sourceChanged: true }]);
  assert.equal((await changed.send()).status, 200);
  assert.equal(changed.state.sheets[0].version, 2);
  assert.equal(changed.state.audits.length, 1);
  const stale = saveFixture([{ ...row, status: 'PENDING' }], { staleUpdate: true });
  assert.equal((await stale.send()).status, 409);
  assert.equal(stale.state.sheets[0].version, 1);
  assert.equal(stale.state.audits.length, 0);
});

test('serialization retries reload the report and commit only once; exhausted retries remain atomic', async () => {
  const f = saveFixture([payableRow()], { serializationFailures: 2 });
  assert.equal((await f.send()).status, 200);
  assert.equal(f.state.attempts, 3);
  assert.equal(f.state.reads, 3);
  assert.equal(f.state.sheets.length, 1);
  assert.equal(f.state.audits.length, 1);
  const exhausted = saveFixture([payableRow()], { serializationFailures: 3 });
  assert.equal((await exhausted.send()).status, 409);
  assert.equal(exhausted.state.attempts, 3);
  assert.equal(exhausted.state.sheets.length, 0);
  assert.equal(exhausted.state.audits.length, 0);
});

test('a transaction timeout rolls back the batch and returns explicit retry guidance', async () => {
  const f = saveFixture([payableRow()], { auditFailure: true });
  const response = await f.send();
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /No changes were committed.*one staff member/);
  assert.equal(f.state.attempts, 1);
  assert.equal(f.state.sheets.length, 0);
  assert.equal(f.state.audits.length, 0);
});

test('invalid batch items identify staff/date and mixed weeks or duplicate sources fail before writing', async () => {
  const f = saveFixture([payableRow()]);
  assert.equal((await f.send([f.items[0], f.items[0]])).status, 400);
  assert.equal((await f.send([f.items[0], { ...f.items[0], sourceKey: 'shift:other', weekStart: '2020-10-12' }])).status, 400);
  assert.equal(f.state.attempts, 0);
  const response = await f.send([{ ...f.items[0], breakMinutes: 600 }]);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Staff 0 \(2020-10-05\).*Break deduction/);
  assert.equal(f.state.writes, 0);
});
