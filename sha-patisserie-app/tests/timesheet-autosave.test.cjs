/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript/React hook test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QueryClient } = require('@tanstack/react-query');
const root = path.resolve(__dirname, '..');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, filename);
  };
}
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
const { paidHours } = require('../lib/timesheets.ts');
const { combinePayroll } = require('../lib/payroll-summary.ts');

function find(node, predicate) {
  if (!React.isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props.children)) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return null;
}

function fixture(t, options = {}) {
  const row = {
    sourceKey: 'shift:a', userId: 'staff', staffName: 'Staff', workDate: '2020-10-05',
    site: 'Sha Patisserie', rate: 30, employmentType: 'CASUAL',
    periods: [{ start: '2020-10-05T01:00:00Z', end: '2020-10-05T09:00:00Z' }],
    actual: [], breakMinutes: 0, actualBreakMinutes: null, scheduledBreakMinutes: 0,
    status: 'APPROVED', version: 2, snapshot: 'snapshot', reason: '', history: [],
    attendanceStatus: 'WORKED', ambiguous: false, inProgress: false, sourceChanged: false,
    exceptions: [], approvalBlockedReason: null, ...options.row,
  };
  const states = [];
  const refs = [];
  let stateCursor = 0;
  let refCursor = 0;
  let refetches = 0;
  const other = { ...row, sourceKey: 'shift:b', userId: 'other', staffName: 'Other' };
  const reportKey = ['timesheet-report', 'admin', '2020-10-05'];
  const client = new QueryClient();
  let savedReport = { shifts: options.otherRow ? [row, other] : [row], rows: options.payrollRows ?? [],
    venues: [], approvedCount: 1, excludedCount: 0 };
  client.setQueryData(reportKey, savedReport);
  let queryError = null;
  const requests = [];
  let fail = options.fail;
  let failKey = options.failKey;
  const pending = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, '/api/admin/reports/timesheets');
    const payload = JSON.parse(init.body);
    requests.push(payload);
    if (options.deferred) await new Promise((resolve) => { pending.push(resolve); });
    if (fail || payload.sourceKey === failKey) return Response.json({ error: 'Concurrent update. Refresh first.' }, { status: 409 });
    if (options.nonJson) return new Response('Unavailable', { status: 503 });
    const saved = savedReport.shifts.find((entry) => entry.sourceKey === payload.sourceKey);
    assert.equal(payload.version, saved.version);
    const updated = { ...saved, periods: payload.periods, breakMinutes: payload.breakMinutes,
      version: saved.version + 1, status: 'APPROVED' };
    savedReport = { ...savedReport, shifts: savedReport.shifts.map((entry) => entry.sourceKey === updated.sourceKey ? updated : entry), rows: [{
      key: 'pay', userId: saved.userId, staffName: saved.staffName, site: saved.site, rate: 30,
      totalHours: paidHours(updated.periods, updated.breakMinutes), leaveHours: 0,
      combinedHours: paidHours(updated.periods, updated.breakMinutes),
      gross: paidHours(updated.periods, updated.breakMinutes) * 30,
    }] };
    return Response.json({ message: 'Worked hours approved.', shifts: [updated],
      rows: savedReport.rows, approvedCount: savedReport.approvedCount, excludedCount: savedReport.excludedCount });
  });
  const hookReact = {
    ...React,
    useState(initial) {
      const index = stateCursor++;
      if (!(index in states)) states[index] = index === 1 ? '2020-10-05' :
        typeof initial === 'function' ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useRef(initial) {
      const index = refCursor++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useEffect() {},
  };
  const filename = path.join(root, 'components', 'TimesheetReview.tsx');
  delete require.cache[filename];
  const load = Module._load;
  Module._load = function (request, ...args) {
    if (request === 'react') return hookReact;
    if (request === '@tanstack/react-query') return {
      useQueryClient: () => client,
      useQuery: () => ({
        data: client.getQueryData(reportKey), isPending: false, isFetching: false, error: queryError,
        refetch: async () => {
          refetches++;
          if (options.refreshFails) {
            queryError = new Error('Refresh failed');
            return { data: client.getQueryData(reportKey), error: queryError };
          }
          client.setQueryData(reportKey, savedReport);
          return { data: savedReport, error: null };
        },
      }),
    };
    return load.call(this, request, ...args);
  };
  let Review;
  try { Review = require(filename).default; }
  finally { Module._load = load; delete require.cache[filename]; }
  const render = () => {
    stateCursor = 0; refCursor = 0;
    return Review({ userId: 'admin' });
  };
  const input = () => find(render(), (node) => node.props['aria-label'] === 'Adjusted hours for Staff on 2020-10-05');
  return {
    render, input, requests, row,
    change: (value) => input().props.onChange({ target: { value } }),
    blur: () => input().props.onBlur(),
    finish: () => { assert.ok(pending.length); pending.shift()(); },
    get cachedReport() { return client.getQueryData(reportKey); },
    get savedReport() { return savedReport; },
    advanceVersion: () => {
      savedReport = { ...savedReport, shifts: savedReport.shifts.map((row) => ({ ...row, version: row.version + 1 })) };
    },
    allowSave: () => { fail = false; failKey = undefined; },
    get refetches() { return refetches; },
    remount: () => { states.length = 0; refs.length = 0; return input(); },
  };
}

test('changed hours save and approve once, updating cached entry and payroll without refetching', async (t) => {
  const f = fixture(t);
  f.change('6.75');
  assert.equal(f.requests.length, 0);
  await f.blur();
  assert.equal(f.requests.length, 1);
  const payload = f.requests[0];
  assert.equal(payload.action, 'APPROVE');
  assert.equal(payload.sourceKey, f.row.sourceKey);
  assert.equal(payload.version, 2);
  assert.equal(payload.snapshot, 'snapshot');
  assert.equal(payload.batch, undefined);
  assert.equal(paidHours(payload.periods, payload.breakMinutes), 6.75);
  assert.equal(f.refetches, 0);
  assert.equal(f.cachedReport.rows[0].totalHours, 6.75);
  assert.equal(f.cachedReport.rows[0].gross, 202.5);
  assert.equal(paidHours(f.savedReport.shifts[0].periods, f.savedReport.shifts[0].breakMinutes), 6.75);
  assert.ok(find(f.render(), (node) => node.props.role === 'status' &&
    React.Children.toArray(node.props.children).includes('Saved and approved')));
  assert.equal(f.remount().props.value, 6.75);
  f.change('7');
  await f.blur();
  assert.equal(f.requests[1].version, 3);
});

test('untouched inputs do not save, inputs stay enabled, and duplicate blurs cannot start concurrent writes', async (t) => {
  const f = fixture(t, { deferred: true });
  await f.blur();
  assert.equal(f.requests.length, 0);
  f.change('7');
  const saving = f.blur();
  assert.equal(f.input().props.disabled, false);
  const duplicate = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.requests.length, 1);
  f.finish();
  await Promise.all([saving, duplicate]);
});

test('failed edits remain visible and retryable', async (t) => {
  const f = fixture(t, { fail: true });
  f.change('6.75');
  await f.blur();
  assert.equal(f.input().props.value, 6.75);
  assert.equal(f.refetches, 0);
  assert.ok(find(f.render(), (node) => node.props.role === 'alert' &&
    String(node.props.children).includes('Concurrent update')));
  const retry = find(f.render(), (node) => node.props['aria-label'] === 'Retry saving hours for Staff on 2020-10-05');
  assert.ok(retry);
  f.allowSave();
  await retry.props.onClick();
  assert.equal(f.refetches, 0);
  assert.equal(f.input().props.value, 6.75);
});

test('refresh after a conflict retains the draft and retries against the latest committed version', async (t) => {
  const f = fixture(t, { fail: true });
  f.change('7');
  f.advanceVersion();
  await f.blur();
  const refresh = find(f.render(), (node) => node.type === 'button' && node.props.children === 'Refresh');
  assert.equal(refresh.props.disabled, false);
  refresh.props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.input().props.value, 7);
  assert.equal(f.cachedReport.shifts[0].version, 3);
  f.allowSave();
  await f.blur();
  assert.equal(f.requests[1].version, 3);
  assert.equal(f.cachedReport.shifts[0].version, 4);
  assert.equal(find(f.render(), (node) => node.props.role === 'alert'), null);
});

test('saving one entry does not submit or clear other unsaved adjustments', async (t) => {
  const f = fixture(t, { otherRow: true });
  f.change('7');
  const otherInput = () => find(f.render(), (node) => node.props['aria-label'] === 'Adjusted hours for Other on 2020-10-05');
  otherInput().props.onChange({ target: { value: '6.5' } });
  await f.blur();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].sourceKey, 'shift:a');
  assert.equal(otherInput().props.value, 6.5);
});

test('approval rules reject missing pay rates without sending a write or dropping the edit', async (t) => {
  const f = fixture(t, { row: { rate: null } });
  f.change('7');
  await f.blur();
  assert.equal(f.requests.length, 0);
  assert.equal(f.input().props.value, 7);
  assert.ok(find(f.render(), (node) => node.props.role === 'alert' &&
    String(node.props.children).includes('Set a valid hourly rate')));
});

test('blank and invalid hours never become a saved zero; explicit zero is saved', async (t) => {
  const f = fixture(t);
  for (const value of ['', '-1', '25']) {
    f.change(value);
    await f.blur();
    assert.equal(f.requests.length, 0);
    assert.ok(find(f.render(), (node) => node.props.role === 'alert'));
  }
  f.change('0');
  await f.blur();
  assert.equal(f.requests.length, 1);
  assert.deepEqual(f.requests[0].periods, []);
  assert.equal(f.requests[0].breakMinutes, 0);
});

test('non-JSON failures retain the edit and explain that save status must be checked', async (t) => {
  const f = fixture(t, { nonJson: true });
  f.change('7');
  await f.blur();
  assert.equal(f.input().props.value, 7);
  assert.ok(find(f.render(), (node) => node.props.role === 'alert' &&
    String(node.props.children).includes('Unexpected save response')));
});

test('a committed save does not depend on a second report request', async (t) => {
  const f = fixture(t, { refreshFails: true });
  f.change('7');
  await f.blur();
  assert.equal(f.input().props.value, 7);
  assert.equal(f.refetches, 0);
  assert.equal(find(f.render(), (node) => node.props.role === 'alert'), null);
  assert.equal(find(f.render(), (node) => node.props['aria-label'] === 'Retry saving hours for Staff on 2020-10-05'), null);
  await f.blur();
  assert.equal(f.requests.length, 1);
});

test('different cells queue while saving and every edit persists without a full refresh', async (t) => {
  const f = fixture(t, { deferred: true, otherRow: true });
  f.change('7');
  const saving = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  const otherInput = () => find(f.render(), (node) => node.props['aria-label'] === 'Adjusted hours for Other on 2020-10-05');
  assert.equal(otherInput().props.disabled, false);
  otherInput().props.onChange({ target: { value: '6.5' } });
  const queued = otherInput().props.onBlur();
  assert.equal(f.requests.length, 1);
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].sourceKey, 'shift:b');
  f.finish();
  await Promise.all([saving, queued]);
  assert.equal(f.input().props.value, 7);
  assert.equal(otherInput().props.value, 6.5);
  assert.deepEqual(f.savedReport.shifts.map((row) => paidHours(row.periods, row.breakMinutes)), [7, 6.5]);
  assert.equal(f.refetches, 0);
});

test('repeated edits to a saving cell retain the latest value and use the committed version', async (t) => {
  const f = fixture(t, { deferred: true });
  f.change('7');
  const saving = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  f.change('6.5');
  f.blur();
  f.change('6.25');
  f.blur();
  assert.equal(f.requests.length, 1);
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.input().props.value, 6.25);
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].version, 3);
  assert.equal(paidHours(f.requests[1].periods, f.requests[1].breakMinutes), 6.25);
  f.finish();
  await saving;
  assert.equal(f.input().props.value, 6.25);
  assert.equal(f.cachedReport.shifts[0].version, 4);
});

test('a newer unblurred draft is never cleared by an older save finishing', async (t) => {
  const f = fixture(t, { deferred: true });
  f.change('7');
  const saving = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  f.change('6.5');
  f.finish();
  await saving;
  assert.equal(f.input().props.value, 6.5);
  assert.equal(paidHours(f.cachedReport.shifts[0].periods, 0), 7);
  const next = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  f.finish();
  await next;
  assert.equal(f.cachedReport.shifts[0].version, 4);
});

test('a failed cell stays retryable while another queued cell still saves', async (t) => {
  const f = fixture(t, { deferred: true, otherRow: true, failKey: 'shift:a' });
  f.change('7');
  const saving = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  const otherInput = () => find(f.render(), (node) => node.props['aria-label'] === 'Adjusted hours for Other on 2020-10-05');
  otherInput().props.onChange({ target: { value: '6.5' } });
  otherInput().props.onBlur();
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.input().props.value, 7);
  assert.equal(otherInput().props.value, 6.5);
  assert.equal(paidHours(f.savedReport.shifts[0].periods, 0), 8);
  assert.ok(find(f.render(), (node) => node.props['aria-label'] === 'Retry saving hours for Staff on 2020-10-05'));
  f.allowSave();
  const retry = f.blur();
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(paidHours(f.savedReport.shifts[1].periods, 0), 6.5);
  f.finish();
  await Promise.all([saving, retry]);
  assert.equal(paidHours(f.savedReport.shifts[0].periods, 0), 7);
  assert.equal(find(f.render(), (node) => node.props.role === 'alert'), null);
});

test('bulk actions, week changes and exports wait for pending saves but adjustment inputs do not', async (t) => {
  const f = fixture(t, { deferred: true });
  f.change('7');
  const saving = f.blur();
  await new Promise((resolve) => setImmediate(resolve));
  const tree = f.render();
  assert.equal(f.input().props.disabled, false);
  const bulk = find(tree, (node) => node.type === 'button' && renderToStaticMarkup(node).includes('Save and Approved All'));
  assert.equal(bulk.props.disabled, true);
  await bulk.props.onClick();
  assert.equal(f.requests.length, 1);
  assert.equal(find(tree, (node) => node.props.type === 'date').props.disabled, true);
  find(tree, (node) => node.props.role === 'tab' && node.props.children === 'Payroll Summary').props.onClick();
  assert.equal(find(f.render(), (node) => node.type === 'button' && node.props.children === 'Download approved CSV').props.disabled, true);
  f.finish();
  await saving;
});

test('payroll table and footer use hour headings and share the CSV leave range formatter', (t) => {
  const payrollRows = combinePayroll([{
    key: 'pay', userId: 'staff', staffName: 'Staff', site: 'Sha', rate: 30, totalHours: 20, gross: 600,
  }], ['2026-11-16', '2026-11-17', '2026-11-22'].map((date, index) => ({
    id: `${index}`, userId: 'staff', staffName: 'Staff', site: 'Sha', rate: 30,
    date, type: 'ANNUAL', hours: 8,
  })));
  const f = fixture(t, { payrollRows });
  find(f.render(), (node) => node.props.role === 'tab' && node.props.children === 'Payroll Summary').props.onClick();
  const html = renderToStaticMarkup(f.render());
  assert.match(html, /Worked Hours \(H\)/);
  assert.match(html, /Leave Hours \(H\)/);
  assert.match(html, /Total Hours \(H\)/);
  assert.match(html, /Leave Date Range/);
  assert.match(html, /16-11-2026 to 17-11-2026; 22-11-2026 to 22-11-2026/);
  assert.match(html, /data-label="Worked hours \(H\)"[^>]*>20\.00</);
  assert.match(html, /data-label="Leave hours \(H\)"[^>]*>24\.00</);
  assert.match(html, /data-label="Total hours \(H\)"[^>]*>44\.00</);
  assert.match(html, /data-label="Total paid hours \(H\)"[^>]*>44\.00</);
  assert.doesNotMatch(html, />\d+\.\d+ h</);
});
