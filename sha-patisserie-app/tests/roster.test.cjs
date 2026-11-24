/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required for this isolated TypeScript loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
      },
    });
    module._compile(result.outputText, filename);
  };
}
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};

const { fetchRosterLeave } = require('../lib/roster-leave.ts');
const staff = [
  { id: 'sam', name: 'Sam', employmentType: 'PART_TIME', location: { code: 'SHA', name: 'Sha Patisserie' } },
  { id: 'lee', name: 'Lee', employmentType: 'FULL_TIME', location: { code: 'ZB', name: 'Zushi Bento' } },
];
const leaveEntry = (id, day, status, userId = 'sam', type = 'ANNUAL') => ({
  id, userId, workDate: `2026-12-${day}T00:00:00.000Z`, status, type, hours: '7.5',
});
const requests = [
  leaveEntry('approved', '25', 'APPROVED'),
  leaveEntry('pending', '22', 'PENDING'),
  leaveEntry('rejected', '23', 'REJECTED'),
  leaveEntry('cancelled', '24', 'CANCELLED'),
  leaveEntry('cancelling', '26', 'CANCEL_REQUESTED', 'sam', 'PERSONAL'),
  leaveEntry('other-venue', '25', 'APPROVED', 'lee', 'UNPAID'),
  leaveEntry('next-week', '28', 'APPROVED'),
];

test('staff navigation hides Payslips but keeps clock, roster and leave', () => {
  const BottomNav = require('../components/BottomNav.tsx').default;
  const html = renderToStaticMarkup(React.createElement(BottomNav, { activeTab: 'clock', setActiveTab: () => {} }));
  assert.doesNotMatch(html, /Payslips/);
  for (const label of ['Clock In', 'Roster', 'Leave']) assert.ok(html.includes(label));
  const source = ts.transpileModule(fs.readFileSync(path.join(root, 'components/DashboardTabs.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, removeComments: true },
  }).outputText;
  assert.doesNotMatch(source, /PayslipView/);
});

test('payroll hides leave table and leave export while preserving worked payroll', async (t) => {
  const report = {
    shifts: [], rows: [{
      key: 'pay', userId: 'sam', staffName: 'Sam', employmentType: 'PART_TIME',
      site: 'Sha Patisserie', rate: 30, totalHours: 8, gross: 240,
    }],
    excludedCount: 0, approvedCount: 1, venues: ['Sha Patisserie'],
    leaveRows: [{
      id: 'leave', userId: 'sam', staffName: 'Sam', employmentType: 'PART_TIME',
      site: 'Sha Patisserie', date: '2026-12-21', type: 'ANNUAL', hours: 7.5,
    }],
  };
  let index = 0;
  const preset = ['payroll', '2026-12-21'];
  const hookReact = {
    ...React,
    useState(initial) {
      const position = index++;
      return [position < preset.length ? preset[position] : typeof initial === 'function' ? initial() : initial, () => {}];
    },
    useEffect: () => {},
    useRef: (initial) => ({ current: initial }),
  };
  const filename = path.join(root, 'components/TimesheetReview.tsx');
  const load = Module._load;
  delete require.cache[filename];
  let Review;
  Module._load = function (request, ...args) {
    if (request === '@tanstack/react-query') return {
      useQueryClient: () => ({}),
      useQuery: () => ({ data: report, isPending: false, isFetching: false, error: null }),
    };
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const tree = Review({ userId: 'admin' });
  const html = renderToStaticMarkup(tree);
  assert.doesNotMatch(html, /Approved Leave|Leave hours|ANNUAL/);
  assert.match(html, /240\.00/);
  assert.match(html, /Confirm Worked Hours/);
  let csvBlob;
  t.mock.method(URL, 'createObjectURL', (blob) => { csvBlob = blob; return 'blob:test'; });
  t.mock.method(URL, 'revokeObjectURL', () => {});
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: () => ({ click() {} }) };
  try {
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Download approved CSV').props.onClick();
    const csv = await csvBlob.text();
    assert.match(csv, /Approved Hours/);
    assert.match(csv, /"Sam","Part Time","Sha Patisserie","30\.00","8\.00","240\.00"/);
    assert.doesNotMatch(csv, /Leave Hours|Leave Type|Leave Date|ANNUAL|7\.50/);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('roster leave loads reviewed requests and includes only effective approvals', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/leave?view=roster&weekStart=2026-10-19');
    return Response.json({ requests });
  });
  assert.deepEqual((await fetchRosterLeave('2026-10-19')).map((entry) => entry.id),
    ['approved', 'cancelling', 'other-venue', 'next-week']);
});

test('roster leave rejects HTTP errors and malformed responses', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Forbidden' }, { status: 403 }));
  await assert.rejects(fetchRosterLeave('2026-10-19'), /Forbidden/);
  fetchMock.mock.mockImplementation(async () => Response.json({}));
  await assert.rejects(fetchRosterLeave('2026-10-19'), /Invalid roster leave response/);
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

test('logout clears account-specific report data before navigating away', async (t) => {
  const { QueryClient } = require('@tanstack/react-query');
  const client = new QueryClient();
  t.after(() => client.clear());
  client.setQueryData(['timesheet-report', 'admin', '2020-10-05'], { rows: [] });
  let destination;
  let failure = true;
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async () => Response.json({}, { status: failure ? 500 : 200 }));
  const filename = path.join(root, 'components/LogoutButton.tsx');
  const load = Module._load;
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    if (request === '@tanstack/react-query') return { useQueryClient: () => client };
    if (request === 'react') return { ...React, useState: () => [false, () => {}] };
    if (request === 'next/navigation') return { useRouter: () => ({
      push: (path) => {
        assert.equal(client.getQueryCache().getAll().length, 0);
        destination = path;
      },
      refresh() {},
    }) };
    return load.call(this, request, ...args);
  };
  let Logout;
  try { Logout = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  await Logout({ children: 'Log out' }).props.onClick();
  assert.equal(destination, undefined);
  assert.equal(client.getQueryCache().getAll().length, 1);
  failure = false;
  await Logout({ children: 'Log out' }).props.onClick();
  assert.equal(destination, '/login');
});

test('reports retain table/drafts while syncing and reuse account/week cache on revisit', async (t) => {
  const { QueryClient, QueryObserver } = require('@tanstack/react-query');
  const row = {
    sourceKey: 'shift:a', userId: 'sam', staffName: 'Sam', workDate: '2020-10-05',
    site: 'Sha Patisserie', employmentType: 'PART_TIME', rate: 30,
    periods: [], actual: [], breakMinutes: 0, actualBreakMinutes: null,
    status: 'PENDING', version: 1, snapshot: 'snapshot', reason: '', history: [],
    ambiguous: false, inProgress: false, sourceChanged: false, exceptions: [],
  };
  const report = { shifts: [row], rows: [], venues: [], approvedCount: 0, excludedCount: 1 };
  const states = ['confirm', '2020-10-05', '', '', '', '', '', null, {}, false, {}];
  let cursor = 0;
  let options;
  let activeUser = 'admin';
  let queryState = { data: report, isPending: false, isFetching: false, error: null };
  let finishRefresh;
  let refreshes = 0;
  const useQuery = (config) => {
    options = config;
    return {
      ...queryState,
      refetch: async () => {
        refreshes++;
        queryState = { ...queryState, isFetching: true };
        await new Promise((resolve) => { finishRefresh = resolve; });
        queryState = { ...queryState, isFetching: false };
        return { data: report, error: queryState.error };
      },
    };
  };
  const hookReact = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect: () => {},
    useRef: (initial) => ({ current: initial }),
  };
  const filename = path.join(root, 'components/TimesheetReview.tsx');
  const load = Module._load;
  delete require.cache[filename];
  let Review;
  Module._load = function (request, ...args) {
    if (request === '@tanstack/react-query') return { useQuery, useQueryClient: () => ({}) };
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const render = () => { cursor = 0; return Review({ userId: activeUser }); };
  let gets = 0;
  let rejectSave = false;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (init?.method === 'POST') {
      return rejectSave ? Response.json({ error: 'Concurrent update.' }, { status: 409 }) : Response.json({ message: 'Saved' });
    }
    gets++;
    return Response.json(report);
  });
  let tree = render();
  const adjustment = (node) => node.props['aria-label']?.startsWith('Adjusted hours');
  findElement(tree, adjustment).props.onChange({ target: { value: '3.5' } });
  tree = render();
  const classification = findElement(tree, (node) => node.props['aria-label']?.startsWith('Attendance for'));
  classification.props.onChange({ target: { value: 'WORKED' } });
  await new Promise(setImmediate);
  tree = render();
  assert.equal(refreshes, 1);
  assert.match(renderToStaticMarkup(tree), /Updating report in the background/);
  assert.doesNotMatch(renderToStaticMarkup(tree), /Loading staff timesheets/);
  assert.equal(findElement(tree, adjustment).props.value, 3.5);
  finishRefresh();
  await new Promise(setImmediate);
  tree = render();
  assert.equal(findElement(tree, adjustment).props.value, 3.5);
  rejectSave = true;
  findElement(tree, (node) => node.props['aria-label']?.startsWith('Attendance for'))
    .props.onChange({ target: { value: 'LATE_CLOCK_IN' } });
  await new Promise(setImmediate);
  assert.equal(refreshes, 1);
  assert.match(renderToStaticMarkup(render()), /Concurrent update/);
  assert.equal(findElement(render(), adjustment).props.value, 3.5);

  queryState = { ...queryState, error: new Error('Network unavailable') };
  tree = render();
  assert.match(renderToStaticMarkup(tree), /Displayed figures may be outdated/);
  assert.equal(findElement(tree, (node) => node.type === 'button' &&
    renderToStaticMarkup(node).includes('Save and Approved All')).props.disabled, true);
  queryState = { data: undefined, isPending: true, isFetching: true, error: null };
  states[1] = '2020-10-12';
  tree = render();
  assert.match(renderToStaticMarkup(tree), /Loading staff timesheets/);
  assert.equal(findElement(tree, (node) => node.type === 'tbody'), null);

  states[1] = '2020-10-05';
  queryState = { data: report, isPending: false, isFetching: false, error: null };
  render();
  assert.deepEqual(options.queryKey, ['timesheet-report', 'admin', '2020-10-05']);
  const client = new QueryClient();
  t.after(() => client.clear());
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  await client.fetchQuery(options);
  assert.equal(gets, 1);
  unsubscribe();
  const revisit = new QueryObserver(client, options);
  const stop = revisit.subscribe(() => {});
  assert.deepEqual(revisit.getCurrentResult().data, report);
  await new Promise(setImmediate);
  assert.equal(gets, 1);
  stop();
  activeUser = 'another-admin';
  render();
  assert.equal(client.getQueryData(options.queryKey), undefined);
  assert.equal(options.staleTime, 60_000);
  assert.equal(options.refetchOnWindowFocus, false);
  assert.equal(options.refetchInterval, false);
  states[1] = require('../lib/timesheets.ts').currentWeek();
  render();
  assert.equal(options.refetchInterval, false);
  states[8] = {};
  render();
  assert.equal(options.refetchInterval, 60_000);
  assert.equal(options.refetchIntervalInBackground, false);
  states[9] = true;
  render();
  assert.equal(options.refetchInterval, false);
  states[9] = false;
  states[7] = row;
  render();
  assert.equal(options.refetchInterval, false);
});

test('overlap review exposes additional same-day entries and requires a manager reason', async (t) => {
  const row = {
    sourceKey: 'log:attendance', userId: 'sam', staffName: 'Sam', workDate: '2020-10-05',
    site: 'Sha Patisserie', employmentType: 'PART_TIME', rate: 30,
    periods: [{ start: '2020-10-05T01:00:00Z', end: '2020-10-05T05:00:00Z' }],
    actual: [{ id: 'attendance', clockIn: '2020-10-05T01:00:00Z', clockOut: '2020-10-05T05:00:00Z' }],
    scheduledStart: null, scheduledEnd: null, actualBreakMinutes: 0, scheduledBreakMinutes: 0,
    breakMinutes: 0, reason: '', history: [], status: 'PENDING', version: 0, snapshot: 'snapshot',
    ambiguous: true, inProgress: false, sourceChanged: false, exceptions: ['Overlapping roster attendance'],
  };
  const other = { ...row, sourceKey: 'shift:other', periods: [], actual: [] };
  const report = { shifts: [other, row], rows: [], venues: ['Sha Patisserie'], approvedCount: 0, excludedCount: 2 };
  const states = ['confirm', '2020-10-05', '', '', '', '', '', row, {}, false, {}];
  let cursor = 0;
  const hookReact = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect: () => {},
    useRef: () => ({ current: null }),
  };
  const filename = path.join(root, 'components/TimesheetReview.tsx');
  const load = Module._load;
  delete require.cache[filename];
  let Review;
  Module._load = function (request, ...args) {
    if (request === '@tanstack/react-query') return {
      useQueryClient: () => ({}),
      useQuery: () => ({ data: report, isPending: false, isFetching: false, error: null,
        refetch: async () => ({ data: report, error: null }) }),
    };
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  t.mock.method(console, 'error', () => {});
  let writes = 0;
  t.mock.method(globalThis, 'fetch', async () => { writes++; return Response.json({ message: 'Approved' }); });
  const tree = Review({ userId: 'admin' });
  const additional = findElement(tree, (node) => node.type === 'button' &&
    renderToStaticMarkup(node).includes('Additional entry:'));
  assert.ok(additional);
  additional.props.onClick();
  assert.equal(states[7].sourceKey, 'shift:other');

  const editor = findElement(tree, (node) => typeof node.type === 'function' && node.props.row === row &&
    typeof node.props.onClose === 'function');
  assert.ok(editor);
  const editorOffset = cursor;
  const renderEditor = () => { cursor = editorOffset; return editor.type(editor.props); };
  let dialog = renderEditor();
  assert.match(renderToStaticMarkup(dialog), /Review reason \(required\)/);
  const approve = () => findElement(dialog, (node) => node.type === 'button' &&
    renderToStaticMarkup(node).includes('Save &amp; approve'));
  await approve().props.onClick();
  assert.equal(writes, 0);
  dialog = renderEditor();
  assert.match(renderToStaticMarkup(dialog), /Explain adjusted times/);
  findElement(dialog, (node) => node.type === 'textarea').props.onChange({
    target: { value: 'Verified duplicate roster; allocate attendance once.' },
  });
  dialog = renderEditor();
  await approve().props.onClick();
  assert.equal(writes, 1);

  cursor = 0;
  const batchTree = Review({ userId: 'admin' });
  const bulk = findElement(batchTree, (node) => node.type === 'button' &&
    renderToStaticMarkup(node).includes('Save and Approved All'));
  assert.ok(bulk);
  await bulk.props.onClick();
  assert.match(states[2], /individual review/);
  assert.equal(writes, 1);
});

test('past unfinished attendance is editable with a reason; live and approved hours remain locked', async (t) => {
  const { perthDate, currentWeek } = require('../lib/timesheets.ts');
  const today = perthDate(new Date());
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const pastDate = yesterday.toISOString().slice(0, 10);
  const week = currentWeek();
  const monday = new Date(`${week}T00:00:00Z`);
  // Use a past week to keep the missing-clock-out case stable on Mondays.
  monday.setUTCDate(monday.getUTCDate() - 7);
  const workDate = monday.toISOString().slice(0, 10);
  const row = {
    sourceKey: 'log:past', userId: 'sam', staffName: 'Sam', workDate,
    site: 'Sha Patisserie', employmentType: 'PART_TIME', rate: 30,
    periods: [], actual: [{ id: 'past', clockIn: `${workDate}T09:00:00+08:00`, clockOut: null }],
    scheduledStart: null, scheduledEnd: null, actualBreakMinutes: null, scheduledBreakMinutes: 0,
    breakMinutes: 0, reason: '', history: [], status: 'PENDING', version: 0, snapshot: 'snapshot',
    ambiguous: false, inProgress: true, sourceChanged: false, exceptions: ['Clock-out or break unfinished'],
  };
  assert.ok(workDate <= pastDate);
  const report = { shifts: [row], rows: [], venues: [], approvedCount: 0, excludedCount: 1 };
  const states = ['confirm', workDate, '', '', '', '', '', null, {}, false, {}];
  let cursor = 0;
  const hookReact = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect: () => {},
    useRef: (initial) => ({ current: initial }),
  };
  const filename = path.join(root, 'components/TimesheetReview.tsx');
  const load = Module._load;
  delete require.cache[filename];
  let Review;
  Module._load = function (request, ...args) {
    if (request === '@tanstack/react-query') return {
      useQueryClient: () => ({}),
      useQuery: () => ({ data: report, isPending: false, isFetching: false, error: null,
        refetch: async () => ({ data: report, error: null }) }),
    };
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const render = () => { cursor = 0; return Review({ userId: 'admin' }); };
  const adjusted = (tree) => findElement(tree, (node) => node.props['aria-label']?.startsWith('Adjusted hours'));
  const classification = (tree) => findElement(tree, (node) => node.props['aria-label']?.startsWith('Attendance for'));
  const approve = (tree) => findElement(tree, (node) => node.type === 'button' &&
    renderToStaticMarkup(node).includes('Save and Approved All'));
  let writes = [];
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    writes.push(JSON.parse(options.body));
    return Response.json({ message: 'Approved' });
  });
  let tree = render();
  assert.match(renderToStaticMarkup(tree), /Missing clock-out/);
  assert.doesNotMatch(renderToStaticMarkup(tree), /In prog\./);
  assert.equal(adjusted(tree).props.disabled, false);
  assert.equal(classification(tree).props.disabled, false);
  adjusted(tree).props.onChange({ target: { value: '3.5' } });
  await approve(render()).props.onClick();
  assert.equal(writes.length, 0);
  assert.match(states[2], /Enter a review reason/);
  tree = render();
  findElement(tree, (node) => node.type === 'textarea').props.onChange({
    target: { value: 'Verified 3.5 hours after forgotten clock-out.' },
  });
  await approve(render()).props.onClick();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].batch[0].periods[0].start, row.actual[0].clockIn);
  assert.equal(writes[0].batch[0].periods[0].end, new Date(`${workDate}T12:30:00+08:00`).toISOString());
  assert.match(writes[0].batch[0].reason, /Verified 3.5/);
  assert.equal(row.actual[0].clockOut, null);

  states[1] = week;
  row.workDate = today;
  row.actual[0].clockIn = `${today}T09:00:00+08:00`;
  tree = render();
  assert.equal(adjusted(tree).props.disabled, true);
  assert.equal(classification(tree).props.disabled, true);
  assert.match(renderToStaticMarkup(tree), /In progress/);
  await approve(tree).props.onClick();
  assert.equal(writes.length, 1);

  row.workDate = workDate;
  row.status = 'APPROVED';
  states[1] = workDate;
  tree = render();
  assert.equal(adjusted(tree).props.disabled, true);
  assert.equal(classification(tree).props.disabled, true);
});

async function mountRoster(t, file, { shifts = [], failedLeave = false, rosterStaff = staff, selectedWeek = '2026-12-21' } = {}) {
  const states = [];
  const effects = [];
  const listeners = new Map();
  let cursor = 0;
  let firstRender = true;
  let currentRequests = requests;
  const previousWindow = globalThis.window;
  globalThis.window = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  t.after(() => {
    for (const cleanup of effects) cleanup?.();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/api/users') return Response.json(rosterStaff);
    if (url === '/api/shifts') return Response.json(shifts);
    if (url === '/api/leave?view=review') {
      return failedLeave
        ? Response.json({ error: 'Leave unavailable' }, { status: 500 })
        : Response.json({ requests: currentRequests });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  const hookReact = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) {
        states[index] = typeof initial === 'function' ? initial() : initial;
        if (typeof states[index] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(states[index])) states[index] = selectedWeek;
      }
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useMemo: (factory) => factory(),
    useCallback: (callback) => callback,
    useEffect: (setup) => { if (firstRender) effects.push(setup()); },
  };
  const load = Module._load;
  const filename = path.join(root, 'app', 'admin', 'roster', file);
  delete require.cache[filename];
  let Roster;
  Module._load = function (request, ...args) {
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Roster = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const render = () => {
    cursor = 0;
    const tree = Roster();
    firstRender = false;
    return { tree, html: renderToStaticMarkup(tree) };
  };
  render();
  await new Promise(setImmediate);
  return {
    render,
    async refresh(nextRequests) {
      currentRequests = nextRequests;
      listeners.get('focus')();
      await new Promise(setImmediate);
    },
  };
}

for (const file of ['page.tsx', 'rosterview.tsx']) {
  for (const selectedWeek of ['2026-12-28', '2027-01-04']) {
    test(`${file}: inactive staff are hidden in ${selectedWeek}, even with saved shifts`, async (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-12-30T00:00:00Z') });
      const roster = await mountRoster(t, file, {
        selectedWeek,
        rosterStaff: [{ ...staff[0], name: 'Former staff', status: 'INACTIVE' }],
        shifts: [{ id: 'old', userId: 'sam', startTime: `${selectedWeek}T01:00:00Z`,
          endTime: `${selectedWeek}T07:00:00Z`, location: staff[0].location, breakMinutes: 0 }],
      });
      const { html } = roster.render();
      assert.doesNotMatch(html, /Former staff|Edit shift|draft shift/);
    });
  }

  test(`${file}: inactive historical staff retain badge/edit option at their saved shift venue only`, async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-12-30T00:00:00Z') });
    const roster = await mountRoster(t, file, {
      rosterStaff: [{ ...staff[0], regularWorkingHours: {} }, { ...staff[1], name: 'Former staff', status: 'INACTIVE' }],
      shifts: [{ id: 'old', userId: 'lee', startTime: '2026-12-21T01:00:00Z',
        endTime: '2026-12-21T07:00:00Z', location: staff[0].location, roleTag: 'Historical correction', breakMinutes: 0 }],
    });
    let { tree, html } = roster.render();
    assert.match(html, /Former staff/);
    assert.match(html, />Inactive</);
    assert.doesNotMatch(html, /Add Former staff/);
    findElement(tree, (node) => node.props['aria-label'] === 'Add Sam shift on Monday').props.onClick();
    ({ tree, html } = roster.render());
    assert.doesNotMatch(html, /option value="lee"/);
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Close').props.onClick();
    ({ tree } = roster.render());
    findElement(tree, (node) => node.type === 'button' &&
      renderToStaticMarkup(node).includes('Historical correction')).props.onClick();
    ({ html } = roster.render());
    assert.match(html, /option value="lee" selected="">Former staff/);
    ({ tree } = roster.render());
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Close').props.onClick();
    ({ tree } = roster.render());
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Zushi Bento').props.onClick();
    assert.doesNotMatch(roster.render().html, /Former staff/);
  });

  test(`${file}: manual creation and weekly repeats save explicit Perth instants`, async (t) => {
    const roster = await mountRoster(t, file, {
      rosterStaff: staff.map((user) => ({ ...user, regularWorkingHours: {} })),
    });
    let { tree } = roster.render();
    findElement(tree, (node) => node.props['aria-label'] === 'Add Sam shift on Monday').props.onClick();
    const changeTime = (index, value) => {
      ({ tree } = roster.render());
      let count = 0;
      findElement(tree, (node) => node.type === 'input' && node.props.type === 'datetime-local' && count++ === index)
        .props.onChange({ target: { value } });
    };
    changeTime(0, '2026-12-21T09:00');
    changeTime(1, '2026-12-21T15:00');
    ({ tree } = roster.render());
    findElement(tree, (node) => node.type === 'select' && React.Children.toArray(node.props.children)
      .some((child) => child.props?.value === '2')).props.onChange({ target: { value: '2' } });
    ({ tree } = roster.render());
    const originalFetch = globalThis.fetch;
    const writes = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      if (options?.method === 'POST') {
        writes.push(JSON.parse(options.body));
        return Response.json({ id: 'shift' });
      }
      return originalFetch(url, options);
    });
    await findElement(tree, (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.deepEqual(writes.map(({ startTime, endTime }) => [startTime, endTime]), [
      ['2026-12-21T01:00:00.000Z', '2026-12-21T07:00:00.000Z'],
      ['2026-12-28T01:00:00.000Z', '2026-12-28T07:00:00.000Z'],
    ]);
  });

  test(`${file}: editing a saved shift displays and saves Perth 9am-3pm`, async (t) => {
    const roster = await mountRoster(t, file, { shifts: [{
      id: 'shift', userId: 'sam', startTime: '2026-12-21T01:00:00Z',
      endTime: '2026-12-21T07:00:00Z', breakMinutes: 30,
      roleTag: 'Barista', notes: null, user: staff[0], location: staff[0].location, publishedAt: null,
    }] });
    let { tree, html } = roster.render();
    assert.match(html, /9:00 am - 3:00 pm/);
    findElement(tree, (node) => node.type === 'button' && renderToStaticMarkup(node).includes('Barista')).props.onClick();
    ({ tree } = roster.render());
    assert.ok(findElement(tree, (node) => node.type === 'input' && node.props.value === '2026-12-21T09:00'));
    assert.ok(findElement(tree, (node) => node.type === 'input' && node.props.value === '2026-12-21T15:00'));
    const originalFetch = globalThis.fetch;
    let saved;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      if (options?.method === 'PUT') {
        saved = JSON.parse(options.body);
        return Response.json({ id: 'shift' });
      }
      return originalFetch(url, options);
    });
    await findElement(tree, (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.equal(saved.startTime, '2026-12-21T01:00:00.000Z');
    assert.equal(saved.endTime, '2026-12-21T07:00:00.000Z');
  });

  test(`${file}: holidays and green leave render for the selected staff, week and venue`, async (t) => {
    const roster = await mountRoster(t, file);
    let { tree, html } = roster.render();
    assert.match(html, /Public holiday: Christmas Day/);
    assert.match(html, /Public holiday: Boxing Day/);
    assert.match(html, /bg-emerald-100[^>]*><span[^>]*>Annual leave/);
    assert.match(html, /Personal leave/);
    assert.doesNotMatch(html, /Unpaid leave|Approved|Cancellation requested|Pending -|Not approved -|Cancelled -|7\.5| hrs/);
    assert.equal((html.match(/Annual leave/g) || []).length, 1);
    assert.equal((html.match(/Regular hours/g) || []).length, 4);
    assert.doesNotMatch(html, /aria-label="Add Sam (regular )?shift on (Friday|Saturday)"/);

    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Zushi Bento').props.onClick();
    ({ tree, html } = roster.render());
    assert.match(html, /Unpaid leave/);
    assert.doesNotMatch(html, /Annual leave|Personal leave/);
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Sha Patisserie').props.onClick();
    ({ tree } = roster.render());
    findElement(tree, (node) => node.props['aria-label'] === 'Next week').props.onClick();
    ({ html } = roster.render());
    assert.match(html, /Public holiday: Boxing Day Holiday/);
    assert.match(html, /Annual leave/);
    assert.doesNotMatch(html, /Personal leave|Public holiday: Christmas Day/);
  });

  test(`${file}: approved leave replaces existing shifts without deleting them`, async (t) => {
    const roster = await mountRoster(t, file, { shifts: [{
      id: 'shift', userId: 'sam', startTime: '2026-12-21T07:00:00+08:00',
      endTime: '2026-12-21T15:00:00+08:00', breakMinutes: 30,
      roleTag: 'Barista', notes: null, user: staff[0], location: staff[0].location, publishedAt: null,
    }] });
    await roster.refresh([leaveEntry('monday-leave', '21', 'APPROVED')]);
    let { html } = roster.render();
    assert.match(html, /Annual leave/);
    assert.doesNotMatch(html, /Barista|30 min break|Approved|7\.5| hrs/);
    await roster.refresh(requests.map((entry) => ({ ...entry, status: 'CANCELLED' })));
    const result = roster.render();
    const tree = result.tree;
    html = result.html;
    assert.doesNotMatch(html, /Annual leave/);
    assert.match(html, /Barista/);
    const shift = findElement(tree, (node) => node.type === 'button' && renderToStaticMarkup(node).includes('Barista'));
    assert.equal(typeof shift.props.onClick, 'function');
  });

  test(`${file}: public holidays hide saved shifts, suggestions and add buttons for both venues`, async (t) => {
    const roster = await mountRoster(t, file, { shifts: staff.flatMap((user) =>
      ['25', '26'].map((day) => ({
        id: `${user.id}-${day}`, userId: user.id,
        startTime: `2026-12-${day}T07:00:00+08:00`,
        endTime: `2026-12-${day}T15:00:00+08:00`, breakMinutes: 30,
        roleTag: 'Holiday shift', notes: null, user, location: user.location, publishedAt: null,
      }))
    ) });
    await roster.refresh([]);
    let { tree, html } = roster.render();
    const assertHolidayCells = () => {
      assert.match(html, /Public holiday: Christmas Day/);
      assert.match(html, /Public holiday: Boxing Day/);
      assert.doesNotMatch(html, /Holiday shift/);
      assert.equal((html.match(/Regular hours/g) || []).length, 4);
      for (const date of ['25', '26']) {
        const cell = findElement(tree, (node) => node.type === 'td' && node.key?.endsWith(`2026-12-${date}`));
        assert.ok(cell);
        assert.equal(renderToStaticMarkup(cell).replace(/<[^>]*>/g, ''), '');
      }
    };
    assertHolidayCells();
    findElement(tree, (node) => node.type === 'button' && node.props.children === 'Zushi Bento').props.onClick();
    ({ tree, html } = roster.render());
    assertHolidayCells();
  });

  test(`${file}: returning to the tab refreshes cancelled leave`, async (t) => {
    const roster = await mountRoster(t, file);
    assert.match(roster.render().html, /Annual leave/);
    await roster.refresh(requests.map((entry) => ({ ...entry, status: 'CANCELLED' })));
    const { html } = roster.render();
    assert.doesNotMatch(html, /Annual leave|Personal leave/);
    assert.equal((html.match(/Regular hours/g) || []).length, 4);
  });

  test(`${file}: leave loading failures are visible`, async (t) => {
    t.mock.method(console, 'error', () => {});
    const roster = await mountRoster(t, file, { failedLeave: true });
    assert.match(roster.render().html, /Leave unavailable/);
  });
}
