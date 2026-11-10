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
    ADMIN_NOTIFY_EMAILS: 'tricia@example.invalid', APP_URL: '', NEXT_PUBLIC_APP_URL: 'https://staff.example.invalid',
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

test('accepted delivery is traceable by request, recipient and Resend ID without logging note or key', async (t) => {
  environment(t);
  const previous = console.info;
  const logs = [];
  console.info = (...args) => logs.push(args);
  t.after(() => { console.info = previous; });
  const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async () => ({ sent: true, id: 'provider-id' }) },
  });
  assert.deepEqual(await notifyLeaveReview(sample), { sent: true });
  const accepted = logs.find(([label]) => label === 'Leave notification accepted by Resend:');
  assert.deepEqual(accepted[1], { requestId: 'group', recipient: 'tricia@example.invalid', emailId: 'provider-id' });
  assert.ok(logs.some(([label]) => label === 'Leave notification dispatch:'));
  assert.equal(JSON.stringify(logs).includes(sample.note), false);
  assert.equal(JSON.stringify(logs).includes(process.env.RESEND_API_KEY), false);
});

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
  assert.match(html, /bgcolor="#0f172a"/);
  assert.match(html, /Review leave request<\/a>/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /&lt;Staff &amp; Co&gt;/);
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;<br>&quot;Family&quot;/);
  assert.match(html, /https:\/\/staff.example.invalid\/admin\/leave/);
  assert.doesNotMatch(html, /<script>/);
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
    assert.match(html, /Action Required/i);
    assert.doesNotMatch(html, /Staff Note/i);
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
    if (name === 'RESEND_API_KEY' || name === 'FROM_EMAIL') {
      const error = errors.at(-1)[2];
      assert.match(error.message, new RegExp(name));
      const other = name === 'RESEND_API_KEY' ? 'FROM_EMAIL' : 'RESEND_API_KEY';
      assert.equal(error.message.includes(other), false);
      assert.equal(error.message.includes('test-only'), false);
    }
    process.env[name] = previous;
  }
  assert.equal(sends, 0);
  assert.equal(errors.length, 7);
});

test('server-only APP_URL works without a build-time public URL and takes precedence', async (t) => {
  environment(t, { APP_URL: 'https://staff.server.invalid/admin/', NEXT_PUBLIC_APP_URL: '' });
  const emails = [];
  const { notifyLeaveReview } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async (...args) => { emails.push(args); return { sent: true }; } },
  });
  assert.deepEqual(await notifyLeaveReview(sample), { sent: true });
  assert.match(emails[0][2], /https:\/\/staff.server.invalid\/admin\/leave/);
  process.env.NEXT_PUBLIC_APP_URL = 'https://old.example.invalid';
  assert.deepEqual(await notifyLeaveReview(sample), { sent: true });
  assert.doesNotMatch(emails[1][2], /old.example.invalid/);
  process.env.APP_URL = 'http://insecure.example.invalid';
  captureErrors(t);
  assert.deepEqual(await notifyLeaveReview(sample), { sent: false });
  assert.equal(emails.length, 2);
});

test('missed clock-in and clock-out emails use Perth times, admin links and provider idempotency', async (t) => {
  environment(t);
  const emails = [];
  const { notifyMissedClockIn, notifyMissedClockOut } = loadFile('lib/admin-notifications.ts', {
    '@/lib/notify': { sendEmail: async (...args) => { emails.push(args); return { sent: true, id: 'email-id' }; } },
  });
  const delivery = { recipient: 'tricia@example.invalid', idempotencyKey: 'stable-key' };
  assert.deepEqual(await notifyMissedClockIn({
    userId: 'staff', name: '<Staff>', scheduledStart: '2026-11-05T01:00:00Z', minutesLate: 15,
  }, delivery), { sent: true });
  assert.deepEqual(await notifyMissedClockOut({
    userId: 'staff', name: '<Staff>', scheduledEnd: '2026-11-05T09:00:00Z',
  }, delivery), { sent: true });
  for (const email of emails) {
    assert.match(email[2], /05-11-2026/);
    assert.match(email[2], /&lt;Staff&gt;/);
    assert.match(email[2], /https:\/\/staff.example.invalid\/admin\/timesheets/);
    assert.deepEqual(email[3], { idempotencyKey: 'stable-key' });
    assert.match(email[2], /<td align="center" valign="middle" bgcolor="#0f172a" style="padding:12px 20px;[^"]*line-height:20px;mso-line-height-rule:exactly;">/);
    assert.match(email[2], /<a href="https:\/\/staff.example.invalid\/admin\/timesheets" style="display:block;[^"]*font-size:14px;line-height:20px;[^"]*">Review timesheets<\/a>/);
    assert.doesNotMatch(email[2], /bgcolor="#15803d"|border-radius:30px|margin:36px/);
  }
  assert.match(emails[0][2], /09:00/);
  assert.match(emails[1][2], /05:00/);
});

const attendanceShift = {
  id: 'shift', userId: 'staff', locationId: 'sha',
  startTime: new Date('2026-11-05T01:00:00Z'), endTime: new Date('2026-11-05T09:00:00Z'),
  user: { name: 'Staff' },
};
function attendanceModule(mocks = {}) {
  return loadFile('lib/attendance-notifications.ts', {
    '@/lib/prisma': { prisma: {} },
    '@/lib/admin-notifications': {},
    ...mocks,
  });
}

test('attendance alerts activate at exactly 15 minutes, use either venue, and ignore completed attendance', () => {
  const { overdueAttendance } = attendanceModule();
  const shift = attendanceShift;
  const start = (offset) => new Date(shift.startTime.getTime() + offset);
  const end = (offset) => new Date(shift.endTime.getTime() + offset);
  const log = { userId: shift.userId, locationId: 'zushi', clockIn: start(0), clockOut: null };
  assert.equal(overdueAttendance(shift, [shift], [], start(15 * 60000 - 1)).clockIn, false);
  assert.equal(overdueAttendance(shift, [shift], [], start(15 * 60000)).clockIn, true);
  assert.equal(overdueAttendance(shift, [shift], [log], start(15 * 60000)).clockIn, false);
  assert.equal(overdueAttendance(shift, [shift], [log], end(15 * 60000 - 1)).clockOut, false);
  assert.equal(overdueAttendance(shift, [shift], [log], end(15 * 60000)).clockOut, true);
  assert.equal(overdueAttendance(shift, [shift], [], end(15 * 60000)).clockOut, false);
  assert.equal(overdueAttendance(shift, [shift], [{ ...log, clockOut: end(0) }], end(15 * 60000)).clockOut, false);
  assert.equal(overdueAttendance(shift, [shift], [log], end(24 * 60 * 60000 + 1)).clockOut, false);
  const next = { ...shift, id: 'next', startTime: end(0), endTime: end(60 * 60000) };
  assert.equal(overdueAttendance(shift, [shift, next], [log], end(15 * 60000)).clockOut, false);
});

test('attendance checker sends once per recipient, retries failed recipients and excludes unpublished/inactive shifts', async () => {
  const records = new Map();
  const deliveries = [];
  let failSecond = true;
  const now = new Date('2026-11-05T01:15:00Z');
  const prisma = {
    shift: { findMany: async ({ where }) => {
      assert.deepEqual(where.user, { status: 'ACTIVE', isApproved: true });
      assert.deepEqual(where.publishedAt, { not: null });
      return [attendanceShift];
    } },
    timeLog: { findMany: async () => [] },
    attendanceNotification: {
      upsert: async ({ where: { id }, create }) => {
        if (!records.has(id)) records.set(id, { id, createdAt: create.createdAt, sentAt: null, claimUntil: null });
        return records.get(id);
      },
      updateMany: async ({ where, data }) => {
        const record = records.get(where.id);
        if (where.claimToken ? record.claimToken !== where.claimToken :
          record.sentAt || (record.claimUntil && record.claimUntil > now)) return { count: 0 };
        Object.assign(record, data);
        return { count: 1 };
      },
    },
  };
  const { checkAttendanceNotifications } = attendanceModule({
    '@/lib/prisma': { prisma },
    '@/lib/admin-notifications': {
      notificationConfig: () => ({ recipients: ['one@example.invalid', 'two@example.invalid'] }),
      notifyMissedClockIn: async (notification, delivery) => {
        deliveries.push(delivery);
        assert.equal(notification.minutesLate, 15);
        return { sent: !(failSecond && delivery.recipient === 'two@example.invalid') };
      },
    },
  });
  assert.deepEqual(await checkAttendanceNotifications(now), { sent: 1, failed: 1 });
  failSecond = false;
  assert.deepEqual(await checkAttendanceNotifications(new Date(now.getTime() + 10 * 60000)), { sent: 1, failed: 0 });
  assert.deepEqual(await checkAttendanceNotifications(now), { sent: 0, failed: 0 });
  assert.equal(deliveries.length, 3);
  assert.equal(deliveries[1].idempotencyKey, deliveries[2].idempotencyKey);
  assert.notEqual(deliveries[0].idempotencyKey, deliveries[1].idempotencyKey);
});

test('clock-out checker honors active claims, recovers expired claims and sends no clock-in alert', async () => {
  const now = new Date('2026-11-05T09:15:00Z');
  let claimUntil = new Date(now.getTime() + 60000);
  let sentAt = null;
  let sent = 0;
  const prisma = {
    shift: { findMany: async () => [attendanceShift] },
    timeLog: { findMany: async () => [{
      userId: 'staff', locationId: 'zushi', clockIn: attendanceShift.startTime, clockOut: null,
    }] },
    attendanceNotification: {
      upsert: async () => ({ createdAt: now }),
      updateMany: async ({ where, data }) => {
        if (!where.claimToken && (sentAt || claimUntil > now)) return { count: 0 };
        claimUntil = data.claimUntil;
        sentAt = data.sentAt;
        return { count: 1 };
      },
    },
  };
  const { checkAttendanceNotifications } = attendanceModule({
    '@/lib/prisma': { prisma },
    '@/lib/admin-notifications': {
      notificationConfig: () => ({ recipients: ['admin@example.invalid'] }),
      notifyMissedClockIn: async () => { throw new Error('Not a clock-in alert'); },
      notifyMissedClockOut: async (notification) => {
        sent++;
        assert.equal(notification.scheduledEnd, attendanceShift.endTime);
        return { sent: true };
      },
    },
  });
  assert.deepEqual(await checkAttendanceNotifications(now), { sent: 0, failed: 0 });
  claimUntil = new Date(now.getTime() - 1);
  assert.deepEqual(await checkAttendanceNotifications(now), { sent: 1, failed: 0 });
  assert.deepEqual(await checkAttendanceNotifications(now), { sent: 0, failed: 0 });
  assert.equal(sent, 1);
});

test('attendance cron is scheduled every minute and has a persistent claim migration', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(config.crons.some((cron) => cron.path === '/api/cron/attendance' && cron.schedule === '* * * * *'));
  const migration = fs.readFileSync(path.join(root, 'prisma/migrations/20261105000000_attendance_notifications/migration.sql'), 'utf8');
  assert.match(migration, /CREATE TABLE "AttendanceNotification"/);
  assert.match(migration, /PRIMARY KEY \("id"\)/);
  assert.match(migration, /"claimUntil" TIMESTAMP/);
  assert.match(migration, /"sentAt" TIMESTAMP/);
  assert.doesNotMatch(migration, /DROP|DELETE/);
});

test('attendance cron rejects missing/incorrect secrets and exposes checker failures', async (t) => {
  environment(t, { CRON_SECRET: 'cron-test-secret' });
  captureErrors(t);
  let calls = 0;
  let result = { sent: 1, failed: 0 };
  const { GET } = loadFile('app/api/cron/attendance/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    '@/lib/attendance-notifications': { checkAttendanceNotifications: async () => {
      calls++;
      if (result instanceof Error) throw result;
      return result;
    } },
  });
  const request = (secret) => new Request('https://example.invalid/api/cron/attendance', {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
  assert.equal((await GET(request())).status, 401);
  assert.equal((await GET(request('wrong'))).status, 401);
  assert.equal(calls, 0);
  assert.equal((await GET(request('cron-test-secret'))).status, 200);
  result = { sent: 0, failed: 1 };
  assert.equal((await GET(request('cron-test-secret'))).status, 502);
  result = new Error('Database unavailable');
  assert.equal((await GET(request('cron-test-secret'))).status, 500);
  process.env.CRON_SECRET = '';
  assert.equal((await GET(request('cron-test-secret'))).status, 503);
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
  assert.match(emails[0][2], /Review pending users<\/a>/);
  assert.match(emails[0][2], /Sha Patisserie/);
  assert.doesNotMatch(emails[0][2], /pinCode|verificationToken|pending-registrations/);
});

test('date ranges preserve gaps and handle single days, month and year boundaries', () => {
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
  assert.equal(errors.length, 3);
  assert.ok(errors.some(([label]) => label === 'Leave notification recipient failed:'));
  assert.ok(errors.some(([label]) => label === 'Leave notification failed:'));
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
  assert.match((await response.json()).message, /saved.*email could not be sent/);
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
