/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript/React fixture loader. */
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
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
}
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
function load(file, mocks) {
  const filename = path.join(root, file);
  const original = Module._load;
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    return Object.hasOwn(mocks, request) ? mocks[request] : original.call(this, request, ...args);
  };
  try { return require(filename).default; }
  finally { Module._load = original; delete require.cache[filename]; }
}
function hooks(values) {
  let cursor = 0;
  return { ...React,
    useState(initial) {
      const index = cursor++;
      return [index in values ? values[index] : typeof initial === 'function' ? initial() : initial, () => {}];
    },
    useRef: (current) => ({ current }),
    useEffect() {},
    useMemo: (factory) => factory(),
    useCallback: (callback) => callback,
  };
}
const person = {
  id: 'example', name: 'Example Staff Member With A Long Name',
  email: 'a.very.long.staff.email.address.for.mobile.testing@example.invalid',
  status: 'ACTIVE', employmentType: 'PART_TIME', isApproved: true, location: { code: 'SHA', name: 'Sha Patisserie' },
};
const people = Array.from({ length: 8 }, (_, index) => ({
  ...person, id: `example-${index}`, name: `${person.name} ${index + 1}`,
}));
const row = {
  sourceKey: 'shift:example', userId: person.id, staffName: person.name, workDate: '2026-10-26',
  site: 'Sha Patisserie', employmentType: 'PART_TIME', rate: 30,
  periods: [{ start: '2026-10-26T01:00:00Z', end: '2026-10-26T07:00:00Z' }],
  actual: [{ id: 'log', clockIn: '2026-10-26T01:00:00Z', clockOut: '2026-10-26T07:00:00Z' }],
  breakMinutes: 30, actualBreakMinutes: 30, recordedBreaks: [{ start: '2026-10-26T03:00:00Z', end: '2026-10-26T03:30:00Z' }],
  status: 'PENDING', version: 1, snapshot: 'example', reason: '', history: [],
  ambiguous: false, inProgress: false, sourceChanged: false, exceptions: [], scheduledBreakMinutes: 30,
};
function saveFixture(name, html) {
  if (process.env.MOBILE_FIXTURE_DIR) {
    const Nav = load('components/AdminNav.tsx', {});
    const nav = renderToStaticMarkup(React.createElement(Nav, { role: 'ADMIN', pendingCount: 1 }, 'Log out'));
    fs.mkdirSync(process.env.MOBILE_FIXTURE_DIR, { recursive: true });
    fs.writeFileSync(path.join(process.env.MOBILE_FIXTURE_DIR, `${name}.html`),
      `<div class="flex min-h-screen flex-col bg-stone-100 md:flex-row">${nav}<main class="min-w-0 flex-1 p-4 sm:p-6 md:p-10">${html}</main></div>`);
  }
}
test('worked-hours and payroll keep all staff in a scrollable calendar grid with existing controls', () => {
  for (const view of ['confirm', 'payroll', 'review-dialog']) {
    const tab = view === 'review-dialog' ? 'confirm' : view;
    const Review = load('components/TimesheetReview.tsx', {
      react: hooks(view === 'review-dialog'
        ? [tab, '2026-10-26', '', '', '', '', '', row] : [tab, '2026-10-26']),
      '@tanstack/react-query': { useQuery: () => ({
        data: { shifts: people.map((staff) => ({ ...row, userId: staff.id, staffName: staff.name, sourceKey: `shift:${staff.id}` })),
          rows: people.map((staff) => ({ key: staff.id, userId: staff.id, staffName: staff.name,
            site: row.site, employmentType: 'PART_TIME', rate: 30, totalHours: 5.5, gross: 165 })),
        venues: [row.site], approvedCount: 0, excludedCount: 1 },
        isPending: false, isFetching: false, error: null,
      }) },
    });
    const html = renderToStaticMarkup(Review({ userId: 'admin' }));
    assert.match(html, /admin-calendar-table/);
    assert.doesNotMatch(html, /admin-responsive-table/);
    assert.match(html, /role="region"[^>]+tabindex="0"[^>]+admin-calendar-scroll/);
    for (const staff of people) assert.ok(html.includes(staff.name));
    if (tab === 'confirm') {
      assert.equal((html.match(/scope="row"/g) || []).length, people.length);
      assert.equal((html.match(/admin-empty-day/g) || []).length, people.length * 6);
      assert.match(html, /data-label="Mon 26 Oct"/);
      assert.match(html, /data-label="Final total \(hours\)"/);
      assert.match(html, /Adjusted hours for/);
      assert.match(html, /Attendance for/);
      assert.match(html, /Save and Approved/);
      assert.match(html, /Details/);
    } else {
      for (const label of ['Venue', 'Approved rate', 'Approved hours', 'Gross', 'Total gross']) {
        assert.ok(html.includes(`data-label="${label}"`));
      }
      assert.match(html, /165\.00/);
      assert.match(html, /Download approved CSV/);
    }
    if (view === 'review-dialog') assert.match(html, /admin-responsive-form.*max-h-\[90dvh\]/);
    saveFixture(view, html);
  }
});
test('roster labels every day and keeps regular-hours actions and mobile dialog accessible', () => {
  for (const open of [false, true]) {
    const Roster = load('app/admin/roster/page.tsx', {
      react: hooks([people.map((staff) => ({ ...staff, regularWorkingHours: { Monday: { enabled: true, startTime: '09:00', endTime: '15:00' } } })),
        [
          { id: 'published-shift', userId: people[0].id, user: people[0], location: person.location,
            startTime: '2026-10-26T01:00:00Z', endTime: '2026-10-26T07:00:00Z', breakMinutes: 30,
            roleTag: 'Barista', notes: null, publishedAt: '2026-10-25T01:00:00Z' },
          { id: 'draft-shift', userId: people[0].id, user: people[0], location: person.location,
            startTime: '2026-10-27T01:00:00Z', endTime: '2026-10-27T07:00:00Z', breakMinutes: 0,
            roleTag: 'Chef', notes: null, publishedAt: null },
        ], [], false, '', '2026-10-26', 'SHA', null, 1, open]),
    });
    const html = renderToStaticMarkup(Roster());
    assert.match(html, /admin-calendar-table admin-roster-calendar/);
    assert.doesNotMatch(html, /admin-responsive-table/);
    assert.match(html, /role="region"[^>]+tabindex="0"[^>]+admin-calendar-scroll/);
    assert.equal((html.match(/scope="row"/g) || []).length, people.length);
    assert.equal((html.match(/data-label="(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) /g) || []).length, people.length * 7);
    assert.match(html, /admin-touch-actions/);
    assert.match(html, /Add this regular shift instantly/);
    assert.match(html, /Publish roster/);
    assert.match(html, /Barista/);
    assert.match(html, /Chef/);
    assert.match(html, /30 min break/);
    if (open) assert.match(html, /max-h-\[calc\(100dvh-2rem\)\]/);
    saveFixture(open ? 'roster-dialog' : 'roster', html);
  }
});
test('dashboard summary cards are desktop-only while mobile quick links and attendance remain', () => {
  const Dashboard = load('app/admin/page.tsx', {
    '@tanstack/react-query': { useQuery: () => ({ data: { totalStaff: 12, pendingUsers: 0, upcomingShifts: 9, rows: [] }, isLoading: false }) },
  });
  const html = renderToStaticMarkup(React.createElement(Dashboard));
  assert.match(html, /data-testid="dashboard-summary" class="hidden gap-4 md:grid md:grid-cols-3"/);
  assert.match(html, /Quick links/);
  assert.match(html, /Attendance/);
  saveFixture('dashboard', html);
});
test('admin and staff accounts wrap identity and expose labelled actions without duplicate controls', async () => {
  const Admins = load('app/admin/admin-users/page.tsx', {
    '@/lib/session': { getSession: async () => ({ userId: person.id, role: 'ADMIN' }) },
    '@/lib/prisma': { prisma: { user: { findMany: async () => [person] } } },
  });
  const admins = renderToStaticMarkup(await Admins());
  assert.match(admins, /data-label="Email"/);
  assert.match(admins, /data-label="Actions"/);
  assert.match(admins, /Your account/);
  saveFixture('admins', admins);
  const Staff = load('app/admin/staff/page.tsx', { react: hooks([[person], false]) });
  const staff = renderToStaticMarkup(Staff());
  assert.match(staff, /admin-responsive-table/);
  assert.match(staff, /data-label="Location"/);
  assert.match(staff, /data-label="Actions"/);
  assert.match(staff, /View Profile/);
  saveFixture('staff', staff);
  const Pending = load('components/PendingUsersList.tsx', {
    'next/navigation': { useRouter: () => ({ refresh() {} }) },
  });
  const pending = renderToStaticMarkup(React.createElement(Pending, {
    initialUsers: [{ ...person, emailVerified: false }], requireEmailVerification: false, canAssignAdmin: true,
  }));
  assert.match(pending, /grid-cols-2/);
  assert.match(pending, /Approve Staff/);
  assert.match(pending, /Remove/);
  saveFixture('pending', pending);
});
