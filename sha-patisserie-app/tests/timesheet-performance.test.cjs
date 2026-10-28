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
