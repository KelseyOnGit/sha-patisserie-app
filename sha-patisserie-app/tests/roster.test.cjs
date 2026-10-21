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
  const preset = ['payroll', '2026-12-21', report, false];
  const hookReact = {
    ...React,
    useState(initial) {
      const position = index++;
      return [position < preset.length ? preset[position] : typeof initial === 'function' ? initial() : initial, () => {}];
    },
    useEffect: () => {},
  };
  const filename = path.join(root, 'components/TimesheetReview.tsx');
  const load = Module._load;
  delete require.cache[filename];
  let Review;
  Module._load = function (request, ...args) {
    return request === 'react' ? hookReact : load.call(this, request, ...args);
  };
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const tree = Review();
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
    assert.equal(url, '/api/leave?view=review');
    return Response.json({ requests });
  });
  assert.deepEqual((await fetchRosterLeave()).map((entry) => entry.id),
    ['approved', 'cancelling', 'other-venue', 'next-week']);
});

test('roster leave rejects HTTP errors and malformed responses', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Forbidden' }, { status: 403 }));
  await assert.rejects(fetchRosterLeave(), /Forbidden/);
  fetchMock.mock.mockImplementation(async () => Response.json({}));
  await assert.rejects(fetchRosterLeave(), /Invalid roster leave response/);
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

async function mountRoster(t, file, { shifts = [], failedLeave = false } = {}) {
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
    if (url === '/api/users') return Response.json(staff);
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
        if (typeof states[index] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(states[index])) states[index] = '2026-12-21';
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
