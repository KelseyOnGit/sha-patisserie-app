/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript/React test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
}
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
function loadFile(file, mocks) {
  const filename = path.join(root, file);
  const load = Module._load;
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    return Object.hasOwn(mocks, request) ? mocks[request] : load.call(this, request, ...args);
  };
  try { return require(filename); }
  finally { Module._load = load; delete require.cache[filename]; }
}
function fixture() {
  const state = {
    session: { userId: 'staff', role: 'STAFF' },
    log: { id: 'attendance', userId: 'staff', locationId: 'sha',
      clockIn: new Date('2026-10-28T01:00:00Z'), clockOut: null, startBreak: null, endBreak: null },
    shifts: [],
    writes: 0,
    stale: false,
  };
  const db = {
    timeLog: {
      findFirst: async ({ where }) => state.log && state.log.userId === where.userId &&
        state.log.clockOut === null && state.log.clockIn >= where.clockIn.gte ? { ...state.log } : null,
      updateMany: async ({ where, data }) => {
        const log = state.log;
        if (state.stale || !log || log.id !== where.id || log.userId !== where.userId || log.clockOut ||
            log.startBreak !== where.startBreak || log.endBreak !== where.endBreak) return { count: 0 };
        Object.assign(log, data); state.writes++;
        return { count: 1 };
      },
      update: async ({ data }) => { Object.assign(state.log, data); state.writes++; return state.log; },
    },
    shift: {
      findMany: async ({ where }) => state.shifts.filter((s) => s.userId === where.userId &&
        (where.locationId === undefined || s.locationId === where.locationId) &&
        s.startTime < where.startTime.lt && s.endTime > where.endTime.gt),
      updateMany: async ({ where, data }) => {
        const shift = state.shifts.find((s) => s.id === where.id && s.startBreak === where.startBreak && !s.endBreak);
        if (!shift) return { count: 0 };
        Object.assign(shift, data); state.writes++;
        return { count: 1 };
      },
    },
    $transaction: async (work, options) => {
      assert.equal(options.isolationLevel, 'Serializable');
      return work(db);
    },
  };
  const mocks = {
    '@/lib/prisma': { prisma: db },
    '@/lib/session': { getSession: async () => state.session },
    '@/lib/geo': { isWithinOnsiteRange: () => ({ allowed: true }) },
  };
  const breaks = loadFile('app/api/shifts/breaks/route.ts', mocks);
  const clock = loadFile('app/api/shifts/clock/route.ts', mocks);
  return {
    state, breaks, clock,
    send: (action, sessionId = 'attendance') => breaks.POST(new Request('http://localhost/api/shifts/breaks', {
      method: 'POST', body: JSON.stringify({ action, sessionId }),
    })),
    clockOut: () => clock.POST(new Request('http://localhost/api/shifts/clock', {
      method: 'POST', body: JSON.stringify({ action: 'clock-out', location: 'Sha', userLat: 0, userLng: 0 }),
    })),
  };
}
function freeze(t) { t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-28T04:00:00Z') }); }
function shift(overrides = {}) {
  return { id: 'roster', userId: 'staff', locationId: 'sha',
    startTime: new Date('2026-10-28T01:00:00Z'), endTime: new Date('2026-10-28T03:00:00Z'),
    startBreak: null, endBreak: null, presetBreakMinutes: 30, breakMinutes: 30, ...overrides };
}

test('unscheduled attendance can start and finish one break; clock-out is blocked until finished', async (t) => {
  freeze(t);
  const f = fixture();
  assert.equal((await (await f.breaks.GET()).json()).session.id, 'attendance');
  assert.equal((await f.send('FINISH')).status, 409);
  assert.equal((await f.send('START')).status, 200);
  assert.equal(f.state.log.startBreak.toISOString(), '2026-10-28T04:00:00.000Z');
  assert.equal((await f.send('START')).status, 409);
  assert.equal((await f.clockOut()).status, 409);
  assert.equal(f.state.log.clockOut, null);
  t.mock.timers.tick(30 * 60000);
  assert.equal((await f.send('FINISH')).status, 200);
  assert.equal((await f.send('FINISH')).status, 409);
  assert.equal((await f.send('START')).status, 409);
  assert.equal((await f.clockOut()).status, 200);
  assert.equal((await (await f.breaks.GET()).json()).session, null);
  assert.equal(f.state.shifts.length, 0);
});

test('staff working past roster end or across Perth midnight can record session breaks without changing roster', async (t) => {
  freeze(t);
  const f = fixture();
  f.state.shifts = [shift()];
  const before = { ...f.state.shifts[0] };
  assert.equal((await f.send('START')).status, 200);
  assert.deepEqual(f.state.shifts[0], before);
  f.state.log = { ...f.state.log, id: 'overnight', clockIn: new Date('2026-10-28T15:00:00Z'),
    startBreak: null, endBreak: null };
  t.mock.timers.setTime(new Date('2026-10-28T17:00:00Z').getTime());
  assert.equal((await f.send('START', 'overnight')).status, 200);
});

test('break API rejects missing login, other users/sessions, expired attendance, invalid actions and stale updates', async (t) => {
  freeze(t);
  const f = fixture();
  assert.equal((await f.send('START', 'somebody-else')).status, 409);
  assert.equal((await f.send('TOGGLE_APPROVE')).status, 400);
  f.state.stale = true;
  assert.equal((await f.send('START')).status, 409);
  f.state.stale = false;
  f.state.log.userId = 'someone-else';
  assert.equal((await f.send('START')).status, 409);
  f.state.log.userId = 'staff';
  f.state.log.clockIn = new Date('2026-10-26T01:00:00Z');
  assert.equal((await f.send('START')).status, 409);
  f.state.session = null;
  assert.equal((await f.send('START')).status, 401);
  assert.equal((await f.breaks.GET()).status, 401);
  assert.equal(f.state.writes, 0);
});

test('legacy in-progress roster break remains finishable, never copied or added to preset minutes', async (t) => {
  freeze(t);
  const f = fixture();
  f.state.shifts = [shift({ startBreak: new Date('2026-10-28T03:45:00Z') })];
  const current = await (await f.breaks.GET()).json();
  assert.equal(current.session.startBreak, '2026-10-28T03:45:00.000Z');
  assert.equal((await f.clockOut()).status, 409);
  assert.equal((await f.send('FINISH')).status, 200);
  assert.equal(f.state.log.startBreak, null);
  assert.equal(f.state.shifts[0].breakMinutes, 30);
  assert.equal((await f.send('START')).status, 409);
  assert.equal((await f.clockOut()).status, 200);
});

test('a prior session break does not consume a new attendance break', async (t) => {
  freeze(t);
  const f = fixture();
  f.state.log.clockIn = new Date('2026-10-28T03:00:00Z');
  f.state.shifts = [shift({ startBreak: new Date('2026-10-28T02:00:00Z'),
    endBreak: new Date('2026-10-28T02:30:00Z'), endTime: new Date('2026-10-28T05:00:00Z') })];
  assert.equal((await f.send('START')).status, 200);
});

test('legacy break at a different venue is shown, finishable and prevents duplicate breaks and premature clock-out', async (t) => {
  freeze(t);
  const f = fixture();
  f.state.shifts = [shift({ locationId: 'zb', startBreak: new Date('2026-10-28T03:45:00Z') })];
  const current = await (await f.breaks.GET()).json();
  assert.equal(current.session.startBreak, '2026-10-28T03:45:00.000Z');
  const clock = await (await f.clock.GET()).json();
  assert.equal(clock.activeLog.startBreak, current.session.startBreak);
  assert.equal((await f.send('START')).status, 409);
  assert.equal((await f.clockOut()).status, 409);
  assert.equal((await f.send('FINISH')).status, 200);
  assert.equal(f.state.shifts[0].endBreak.toISOString(), '2026-10-28T04:00:00.000Z');
  assert.equal(f.state.log.startBreak, null);
  assert.equal(f.state.log.locationId, 'sha');
  assert.equal((await f.send('START')).status, 409);
  assert.equal((await f.clockOut()).status, 200);
});

test('session breaks work with a different roster venue and preserve the original attendance venue', async (t) => {
  freeze(t);
  const f = fixture();
  f.state.shifts = [shift({ locationId: 'zb', presetBreakMinutes: 45 })];
  assert.equal((await (await f.breaks.GET()).json()).session.presetBreakMinutes, 45);
  assert.equal((await f.send('START')).status, 200);
  t.mock.timers.tick(30 * 60000);
  assert.equal((await f.send('FINISH')).status, 200);
  assert.equal(f.state.log.locationId, 'sha');
  assert.equal(f.state.shifts[0].startBreak, null);
});

test('conflicting legacy breaks across venues fail explicitly instead of choosing one', async (t) => {
  freeze(t);
  t.mock.method(console, 'error', () => {});
  const f = fixture();
  f.state.shifts = [
    shift({ startBreak: new Date('2026-10-28T03:30:00Z') }),
    shift({ id: 'other', locationId: 'zb', startBreak: new Date('2026-10-28T03:45:00Z') }),
  ];
  assert.equal((await f.breaks.GET()).status, 500);
  assert.equal((await f.send('FINISH')).status, 500);
  assert.equal(f.state.writes, 0);
});

test('duplicate concurrent break submissions cannot record the same start twice', async (t) => {
  freeze(t);
  const f = fixture();
  const responses = await Promise.all([f.send('START'), f.send('START')]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
  assert.equal(f.state.writes, 1);
});

test('admin attendance marks unscheduled session breaks as on break and counts them', async (t) => {
  freeze(t);
  const api = loadFile('app/api/admin/attendance/route.ts', {
    '@/lib/session': { getSession: async () => ({ userId: 'admin', role: 'ADMIN' }), isPrivilegedRole: () => true },
    '@/lib/prisma': { prisma: {
      shift: { findMany: async () => [] },
      timeLog: { findMany: async () => [{
        id: 'attendance', userId: 'staff', user: { name: 'Unscheduled' }, location: { name: 'Sha Patisserie' },
        clockIn: new Date('2026-10-28T01:00:00Z'), clockOut: null,
        startBreak: new Date('2026-10-28T03:30:00Z'), endBreak: null,
      }] },
    } },
  });
  const response = await api.GET(new Request('http://localhost/api/admin/attendance?date=2026-10-28'));
  const report = await response.json();
  assert.equal(report.rows[0].status, 'ON_BREAK');
  assert.equal(report.rows[0].scheduled, 'Unscheduled');
  assert.equal(report.summary.onBreak, 1);
  assert.equal(report.summary.clockedIn, 0);
});

test('admin attendance shows rostered staff on approved leave as on leave instead of late', async (t) => {
  freeze(t);
  const leaveQueries = [];
  const shift = (userId, name) => ({ id: userId, userId, user: { name }, location: { name: 'Zushi Bento' },
    startTime: new Date('2026-10-27T23:30:00Z'), endTime: new Date('2026-10-28T06:00:00Z') });
  const api = loadFile('app/api/admin/attendance/route.ts', {
    '@/lib/session': { getSession: async () => ({ userId: 'admin', role: 'ADMIN' }), isPrivilegedRole: () => true },
    '@/lib/prisma': { prisma: {
      shift: { findMany: async () => [shift('bianca', 'Bianca'), shift('late', 'Late Staff')] },
      timeLog: { findMany: async () => [] },
      leaveRequest: { findMany: async ({ where }) => { leaveQueries.push(where); return [{ userId: 'bianca' }]; } },
    } },
  });
  const report = await (await api.GET(new Request('http://localhost/api/admin/attendance?date=2026-10-28'))).json();
  assert.deepEqual(report.rows.map((row) => [row.staffName, row.status]),
    [['Bianca', 'ON_LEAVE'], ['Late Staff', 'POSSIBLE_ABSENCE']]);
  assert.equal(report.summary.onLeave, 1);
  assert.equal(report.summary.late + report.summary.possibleAbsence, 1);
  assert.deepEqual(leaveQueries[0].workDate, new Date('2026-10-28T00:00:00Z'));
  assert.deepEqual(leaveQueries[0].status, { in: ['APPROVED', 'CANCEL_REQUESTED'] });
});

function findElement(node, predicate) {
  if (!React.isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

test('payroll break display ticks elapsed time, stops on completion and distinguishes unrecorded and stale breaks', (t) => {
  freeze(t);
  const states = [];
  let cursor = 0;
  let setup;
  let tick;
  let cleared = false;
  t.mock.method(globalThis, 'setInterval', (callback, ms) => {
    assert.equal(ms, 1000);
    tick = callback;
    return 17;
  });
  t.mock.method(globalThis, 'clearInterval', (id) => { assert.equal(id, 17); cleared = true; });
  const Status = loadFile('components/PayrollBreakStatus.tsx', {
    react: { ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], (next) => { states[index] = next; }];
      },
      useEffect(effect) { setup = effect; },
    },
  }).default;
  const row = { workDate: '2026-10-28', inProgress: true, actualBreakMinutes: null,
    recordedBreaks: [{ start: '2026-10-28T03:55:00Z', end: null }] };
  const render = () => { cursor = 0; return renderToStaticMarkup(Status({ row })); };
  assert.match(render(), /On break.*5:00/);
  const cleanup = setup();
  t.mock.timers.tick(1000);
  tick();
  assert.match(render(), /On break.*5:01/);
  row.recordedBreaks[0].end = '2026-10-28T04:00:00Z';
  row.actualBreakMinutes = 5;
  cleanup();
  assert.equal(cleared, true);
  assert.match(render(), /Break taken.*5m/);
  assert.doesNotMatch(render(), /On break/);
  assert.equal(setup(), undefined);
  row.recordedBreaks = [];
  row.actualBreakMinutes = null;
  assert.match(render(), /Not recorded/);
  row.recordedBreaks = [{ start: '2026-10-27T03:55:00Z', end: null }];
  row.workDate = '2026-10-27';
  assert.match(render(), /Unfinished break/);
  assert.equal(setup(), undefined);
});

test('clock card enables unscheduled breaks, reflects start/end and displays failed status lookups', async (t) => {
  const values = [];
  const effects = [];
  const cleanups = [];
  let cursor = 0;
  let first = true;
  let broken = false;
  let session = { id: 'unscheduled-log', startBreak: null, endBreak: null, presetBreakMinutes: 30 };
  const oldWindow = globalThis.window;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  t.after(() => {
    cleanups.forEach((cleanup) => cleanup?.());
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  });

  t.mock.method(globalThis, 'setInterval', () => 0);
  t.mock.method(globalThis, 'clearInterval', () => {});
  t.mock.method(console, 'error', () => {});
  const state = (initial) => {
    const index = cursor++;
    if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial;
    return [values[index], (next) => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
  };
  const Card = loadFile('components/ClockInCard.tsx', {
    react: { ...React, useState: state,
      useRef(initial) { return state({ current: initial })[0]; },
      useCallback: (callback) => callback,
      useEffect: (effect) => { if (first) effects.push(effect); },
    },
  }).default;
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === '/api/roster/mine') return Response.json({ shifts: [], leave: [] });
    assert.equal(url, '/api/shifts/breaks');
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body);
      assert.equal(body.sessionId, 'unscheduled-log');
      assert.equal(body.shiftId, undefined);
      calls.push(body.action);
      session = body.action === 'START' ? { ...session, startBreak: '2026-10-28T04:00:00Z' } :
        { ...session, endBreak: '2026-10-28T04:30:00Z' };
    }
    return broken ? Response.json({ error: 'Please sign in again.' }, { status: 401 }) : Response.json({ session });
  });
  const render = () => { cursor = 0; const tree = Card({ userName: 'Test' }); first = false; return tree; };
  const button = (label) => findElement(render(), (node) => node.type === 'button' && node.props.children === label);
  render();
  effects.forEach((effect) => cleanups.push(effect()));
  await new Promise(setImmediate);
  assert.equal(button('Start Break').props.disabled, false);
  await button('Start Break').props.onClick();
  assert.equal(button('End Break').props.disabled, false);
  assert.equal(button('Clock Out').props.disabled, true);
  await button('End Break').props.onClick();
  assert.deepEqual(calls, ['START', 'FINISH']);
  assert.equal(button('Break Recorded').props.disabled, true);
  assert.equal(button('Clock Out').props.disabled, false);
  broken = true;
  effects[1]();
  await new Promise(setImmediate);
  assert.match(renderToStaticMarkup(render()), /Please sign in again/);
  assert.equal(button('Clock Out').props.disabled, true);
  broken = false;
  await button('Retry status').props.onClick();
  await new Promise(setImmediate);
  assert.doesNotMatch(renderToStaticMarkup(render()), /Please sign in again/);
});

for (const file of ['components/ClockInCard.tsx', 'app/clock/page.tsx']) {
  test(`${file}: approved leave removes clock-in prompts and refreshes after cancellation`, async (t) => {
    const values = [];
    const effects = [];
    const cleanups = [];
    const focus = [];
    let cursor = 0;
    let first = true;
    let status = 'APPROVED';
    let rosterFails = false;
    const today = require('../lib/leave.ts').perthToday().toISOString().slice(0, 10);
    const oldWindow = globalThis.window;
    globalThis.window = {
      addEventListener: (event, callback) => { if (event === 'focus') focus.push(callback); },
      removeEventListener() {},
    };
    t.after(() => {
      cleanups.forEach((cleanup) => cleanup?.());
      if (oldWindow === undefined) delete globalThis.window;
      else globalThis.window = oldWindow;
    });
    t.mock.method(globalThis, 'setInterval', () => 0);
    t.mock.method(globalThis, 'clearInterval', () => {});
    t.mock.method(console, 'error', () => {});
    const state = (initial) => {
      const index = cursor++;
      if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial;
      return [values[index], (next) => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
    };
    const Page = loadFile(file, {
      react: { ...React, useState: state,
        useRef(initial) { return state({ current: initial })[0]; },
        useCallback: (callback) => callback,
        useEffect: (effect) => { if (first) effects.push(effect); },
      },
      'next/navigation': { useRouter: () => ({ push() {} }) },
    }).default;
    t.mock.method(globalThis, 'fetch', async (url) => {
      if (url === '/api/roster/mine') {
        if (rosterFails) return Response.json({ error: 'Roster unavailable' }, { status: 500 });
        return Response.json({ shifts: [], leave: [{ date: today, status, type: 'Annual leave' }] });
      }
      if (url === '/api/auth/me') return Response.json({ user: { id: 'staff', name: 'Staff' } });
      if (url === '/api/shifts/breaks') return Response.json({ session: null });
      if (url === '/api/shifts/clock') return Response.json({ activeLog: null });
      assert.fail(`Unexpected URL: ${url}`);
    });
    const render = () => {
      cursor = 0;
      const tree = Page({ userName: 'Staff' });
      first = false;
      return tree;
    };
    render();
    effects.forEach((effect) => cleanups.push(effect()));
    await new Promise(setImmediate);
    assert.match(renderToStaticMarkup(render()), /on approved leave today.*No clock-in is required/);
    assert.ok(findElement(render(), (node) => node.type === 'button' && node.props.children === 'Clock In if Working'));
    status = 'CANCEL_REQUESTED';
    focus.forEach((callback) => callback());
    await new Promise(setImmediate);
    assert.match(renderToStaticMarkup(render()), /No clock-in is required/);
    status = 'CANCELLED';
    focus.forEach((callback) => callback());
    await new Promise(setImmediate);
    assert.doesNotMatch(renderToStaticMarkup(render()), /No clock-in is required/);
    assert.ok(findElement(render(), (node) => node.type === 'button' && node.props.children === 'Clock In'));
    rosterFails = true;
    focus.forEach((callback) => callback());
    await new Promise(setImmediate);
    assert.match(renderToStaticMarkup(render()), /Roster unavailable/);
  });
}
