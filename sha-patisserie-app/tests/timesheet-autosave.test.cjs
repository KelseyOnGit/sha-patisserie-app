/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript/React hook test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
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
  let report = { shifts: options.otherRow ? [row, other] : [row], rows: [], venues: [], approvedCount: 1, excludedCount: 0 };
  let savedReport = report;
  let queryError = null;
  const requests = [];
  let fail = options.fail;
  let finish;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, '/api/admin/reports/timesheets');
    const payload = JSON.parse(init.body);
    requests.push(payload);
    if (options.deferred) await new Promise((resolve) => { finish = resolve; });
    if (fail) return Response.json({ error: 'Concurrent update. Refresh first.' }, { status: 409 });
    if (options.nonJson) return new Response('Unavailable', { status: 503 });
    const updated = { ...row, periods: payload.periods, breakMinutes: payload.breakMinutes,
      version: row.version + 1, status: 'APPROVED' };
    savedReport = { ...report, shifts: report.shifts.map((entry) => entry.sourceKey === updated.sourceKey ? updated : entry), rows: [{
      key: 'pay', userId: row.userId, staffName: row.staffName, site: row.site, rate: 30,
      totalHours: paidHours(updated.periods, updated.breakMinutes), leaveHours: 0,
      combinedHours: paidHours(updated.periods, updated.breakMinutes),
      gross: paidHours(updated.periods, updated.breakMinutes) * 30,
    }] };
    return Response.json({ message: 'Worked hours approved.' });
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
      useQuery: () => ({
        data: report, isPending: false, isFetching: false, error: queryError,
        refetch: async () => {
          refetches++;
          if (options.refreshFails) {
            queryError = new Error('Refresh failed');
            return { data: report, error: queryError };
          }
          report = savedReport;
          return { data: report, error: null };
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
    finish: () => finish(),
    allowSave: () => { fail = false; },
    get refetches() { return refetches; },
    remount: () => { states.length = 0; refs.length = 0; return input(); },
  };
}

test('changed hours save one APPROVE request on blur and reload from the database-backed report', async (t) => {
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
  assert.equal(f.refetches, 1);
  assert.ok(find(f.render(), (node) => node.props.role === 'status' && node.props.children === 'Staff (05-10-2020): hours saved and approved.'));
  assert.equal(f.remount().props.value, 6.75);
  f.change('7');
  await f.blur();
  assert.equal(f.requests[1].version, 3);
});

test('untouched inputs do not save and duplicate blurs cannot start concurrent writes', async (t) => {
  const f = fixture(t, { deferred: true });
  await f.blur();
  assert.equal(f.requests.length, 0);
  f.change('7');
  const saving = f.blur();
  assert.equal(f.input().props.disabled, true);
  await f.blur();
  assert.equal(f.requests.length, 1);
  f.finish();
  await saving;
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
  assert.equal(f.refetches, 1);
  assert.equal(f.input().props.value, 6.75);
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

test('refresh failure after a committed save is not presented as a failed write or retried', async (t) => {
  const f = fixture(t, { refreshFails: true });
  f.change('7');
  await f.blur();
  assert.equal(f.input().props.value, 7);
  assert.ok(find(f.render(), (node) => node.props.role === 'alert' &&
    React.Children.toArray(node.props.children).join('').includes('Could not refresh reports')));
  assert.equal(find(f.render(), (node) => node.props['aria-label'] === 'Retry saving hours for Staff on 2020-10-05'), null);
  await f.blur();
  assert.equal(f.requests.length, 1);
});
