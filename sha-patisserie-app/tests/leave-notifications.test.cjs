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
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(result.outputText, filename);
};
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
function environment(t, overrides = {}) {
  for (const [name, value] of Object.entries({
    RESEND_API_KEY: 'test-only', FROM_EMAIL: 'notifications@example.invalid', EMAIL_FROM: '',
    ADMIN_NOTIFY_EMAILS: 'tricia@example.invalid', NEXT_PUBLIC_APP_URL: 'https://staff.example.invalid',
    NODE_ENV: 'production', ...overrides,
  })) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => previous === undefined ? delete process.env[name] : process.env[name] = previous);
  }
}
function captureErrors(t) {
  const previous = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  t.after(() => { console.error = previous; });
  return errors;
}
const sample = {
  event: 'requested', requestId: 'group', staffName: '<Staff & Co>',
  type: 'ANNUAL', dates: ['2027-01-03', '2027-01-02'], totalHours: '15.00',
  note: '<script>bad</script>\n"Family"',
};

test('one escaped email per unique recipient with dd-mm-yyyy dates and the admin link', async (t) => {
  environment(t, { ADMIN_NOTIFY_EMAILS: 'tricia@example.invalid, vanessa@example.invalid, tricia@example.invalid' });
  const emails = [];
  const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async (...args) => { emails.push(args); return { sent: true }; } },
  });
  assert.deepEqual(await notifyLeaveReview(sample), { sent: true });
  assert.equal(emails.length, 2);
  assert.equal(emails[0][0], 'tricia@example.invalid');
  const html = emails[0][2];
  assert.match(html, /02-01-2027 to 03-01-2027/);
  assert.match(html, /Sha Patisserie/);
  assert.match(html, /bgcolor="#166534"/);
  assert.match(html, /Review leave request<\/a>/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /&lt;Staff &amp; Co&gt;/);
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;<br>&quot;Family&quot;/);
  assert.match(html, /https:\/\/staff.example.invalid\/admin\/leave/);
  assert.doesNotMatch(html, /<script>/);
});

test('leave periods collapse consecutive dates without including gaps or duplicating days', () => {
  const { leaveDateRanges } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async () => { throw new Error('Must not send'); } },
  });
  const dates = Array.from({ length: 19 }, (_, index) => `2027-02-${String(index + 10).padStart(2, '0')}`);
  assert.equal(leaveDateRanges(dates), '10-02-2027 to 28-02-2027');
  assert.equal(leaveDateRanges(['2027-02-10']), '10-02-2027');
  assert.equal(leaveDateRanges(['2027-02-14', '2027-02-10', '2027-02-11', '2027-02-10']),
    '10-02-2027 to 11-02-2027; 14-02-2027');
  assert.equal(leaveDateRanges(['2026-12-31', '2027-01-01']), '31-12-2026 to 01-01-2027');
  assert.throws(() => leaveDateRanges([]));
  assert.throws(() => leaveDateRanges(['2027-02-30']));
});

test('all leave email events use the styled layout and preserve review semantics', async (t) => {
  environment(t);
  const emails = [];
  const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async (...args) => { emails.push(args); return { sent: true }; } },
  });
  for (const event of ['requested', 'changed', 'cancellation']) {
    assert.deepEqual(await notifyLeaveReview({ ...sample, event, note: '' }), { sent: true });
    const html = emails.at(-1)[2];
    assert.match(html, /Leave period/);
    assert.match(html, /02-01-2027 to 03-01-2027/);
    assert.match(html, /ACTION REQUIRED/);
    assert.doesNotMatch(html, /STAFF NOTE/);
    if (event === 'requested') assert.doesNotMatch(html, /original leave stays approved/);
    else assert.match(html, /original leave stays approved/);
  }
});

test('configuration problems are explicit failures and never send email', async (t) => {
  environment(t);
  const errors = captureErrors(t);
  let sends = 0;
  const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async () => { sends++; return { sent: true }; } },
  });
  for (const [name, bad] of [
    ['ADMIN_NOTIFY_EMAILS', ''], ['ADMIN_NOTIFY_EMAILS', 'invalid'],
    ['RESEND_API_KEY', ''], ['FROM_EMAIL', ''], ['NEXT_PUBLIC_APP_URL', ''],
    ['NEXT_PUBLIC_APP_URL', 'http://staff.example.invalid'],
    ['NEXT_PUBLIC_APP_URL', 'javascript:alert(1)'],
  ]) {
    const previous = process.env[name];
    process.env[name] = bad;
    assert.deepEqual(await notifyLeaveReview(sample), { sent: false });
    process.env[name] = previous;
  }
  assert.equal(sends, 0);
  assert.equal(errors.length, 7);
});

test('pending-user notification uses the actual admin page, escaped fields and Perth registration time', async (t) => {
  environment(t);
  const emails = [];
  const { notifyPendingRegistration } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async (...args) => { emails.push(args); return { sent: true }; } },
  });
  assert.deepEqual(await notifyPendingRegistration({
    userId: 'staff', name: '<Staff>', email: 'staff@example.invalid',
    registeredAt: '2026-11-03T18:00:00Z',
  }), { sent: true });
  assert.equal(emails.length, 1);
  assert.match(emails[0][2], /https:\/\/staff.example.invalid\/admin\/users/);
  assert.match(emails[0][2], /&lt;Staff&gt;/);
  assert.match(emails[0][2], /04-11-2026/);
  assert.match(emails[0][2], /Sha Patisserie/);
  assert.match(emails[0][2], /Review pending users<\/a>/);
  assert.doesNotMatch(emails[0][2], /pinCode|verificationToken|pending-registrations/);
});

test('pending-user mail configuration and delivery failures are logged and reported', async (t) => {
  environment(t);
  const errors = captureErrors(t);
  const notification = { userId: 'staff', name: 'Staff', email: 'staff@example.invalid', registeredAt: new Date() };
  let sends = 0;
  const { notifyPendingRegistration } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async () => { sends++; return { sent: false, reason: 'Rejected' }; } },
  });
  assert.deepEqual(await notifyPendingRegistration(notification), { sent: false });
  process.env.ADMIN_NOTIFY_EMAILS = '';
  assert.deepEqual(await notifyPendingRegistration(notification), { sent: false });
  assert.equal(sends, 1);
  assert.equal(errors.length, 2);
});

test('provider rejection or exception is logged and reported, without throwing', async (t) => {
  environment(t);
  const errors = captureErrors(t);
  for (const sendEmail of [
    async () => ({ sent: false, reason: 'Rejected' }),
    async () => { throw new Error('Network failed'); },
  ]) {
    const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', { '@/lib/notify': { sendEmail } });
    assert.deepEqual(await notifyLeaveReview(sample), { sent: false });
  }
  assert.equal(errors.length, 2);
});

const request = (body, method = 'POST') => new Request('https://staff.example.invalid/api/leave', {
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const next = new Date(Date.parse(future) + 86400000).toISOString().slice(0, 10);
const submission = { type: 'UNPAID', startDate: future, endDate: next, hours: 7.5, note: 'Away' };

function fixture() {
  const state = { committed: false, fail: false, delivery: true, emails: [], created: [], role: 'STAFF', status: 'APPROVED' };
  const entry = () => ({
    id: 'original', requestGroupId: 'original-group', userId: 'staff', status: state.status,
    type: 'UNPAID', hours: new Prisma.Decimal(7.5), note: 'Away', workDate: new Date(future),
    user: { name: 'Test Staff', employmentType: 'CASUAL' },
  });
  const tx = {
    user: { findUnique: async () => ({ name: 'Test Staff', employmentType: 'CASUAL' }) },
    leaveRequest: {
      findUnique: async () => entry(),
      findMany: async () => [entry(), { ...entry(), id: 'second', workDate: new Date(next) }],
      findFirst: async () => null,
      createMany: async ({ data }) => { state.created.push(...data); },
      updateMany: async () => ({ count: 2 }),
    },
  };
  const routes = loadFile('app/api/leave/route.ts', {
    '@/lib/prisma': { prisma: { $transaction: async (callback) => {
      const result = await callback(tx);
      if (state.fail) throw new Error('Transaction rolled back');
      state.committed = true;
      return result;
    } } },
    '@/lib/session': {
      getSession: async () => ({ userId: 'staff', role: state.role }),
      isPrivilegedRole: (role) => role === 'ADMIN',
    },
    '@/lib/admin-notifications': { notifyLeaveReview: async (notification) => {
      assert.equal(state.committed, true, 'mail must not be sent inside the transaction');
      state.emails.push(notification);
      return { sent: state.delivery };
    } },
  });
  return { state, ...routes };
}

test('multi-day submission and proposed change each notify once after commit', async () => {
  for (const replacesId of [undefined, 'original']) {
    const { state, POST } = fixture();
    const response = await POST(request({ ...submission, replacesId }));
    assert.equal(response.status, 201);
    assert.equal(state.created.length, 2);
    assert.equal(state.emails.length, 1);
    assert.equal(state.emails[0].event, replacesId ? 'changed' : 'requested');
    assert.deepEqual(state.emails[0].dates, [future, next]);
    assert.equal(state.emails[0].totalHours, '15.00');
    assert.equal(state.emails[0].requestId, state.created[0].requestGroupId);
  }
});

test('manager-created approved leave sends no pending-review email', async () => {
  const { state, POST } = fixture();
  state.role = 'ADMIN';
  const response = await POST(request({ ...submission, userId: 'someone-else' }));
  assert.equal(response.status, 201);
  assert.equal(state.created[0].status, 'APPROVED');
  assert.equal(state.emails.length, 0);
});

test('failed or invalid submission does not send notifications', async (t) => {
  captureErrors(t);
  const { state, POST } = fixture();
  state.fail = true;
  assert.equal((await POST(request(submission))).status, 500);
  assert.equal((await POST(request({ ...submission, hours: -1 }))).status, 400);
  assert.equal(state.emails.length, 0);
});

test('email failure preserves saved leave and warns not to resubmit', async () => {
  const { state, POST } = fixture();
  state.delivery = false;
  const response = await POST(request(submission));
  assert.equal(response.status, 201);
  assert.equal(state.committed, true);
  assert.match((await response.json()).message, /saved.*email could not be sent.*do not submit again/);
});

test('cancellation notifies once after commit; repeated cancellation does not notify again', async () => {
  const { state, PATCH } = fixture();
  const response = await PATCH(request({ action: 'request-cancel', id: 'original' }, 'PATCH'));
  assert.equal(response.status, 200);
  assert.equal(state.emails.length, 1);
  assert.equal(state.emails[0].event, 'cancellation');
  assert.equal(state.emails[0].totalHours, '15.00');
  state.status = 'CANCEL_REQUESTED';
  assert.equal((await PATCH(request({ action: 'request-cancel', id: 'original' }, 'PATCH'))).status, 409);
  assert.equal(state.emails.length, 1);
});

test('withdrawal sends no review email', async () => {
  const { state, PATCH } = fixture();
  state.status = 'PENDING';
  assert.equal((await PATCH(request({ action: 'withdraw', id: 'original' }, 'PATCH'))).status, 200);
  assert.equal(state.emails.length, 0);
});
