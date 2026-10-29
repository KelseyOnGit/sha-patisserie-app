/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript test loader. */
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
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(result.outputText, filename);
  };
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
function environment(t) {
  for (const [name, value] of Object.entries({
    RESEND_API_KEY: 'test-only', FROM_EMAIL: 'Staff <staff@example.invalid>',
    NEXT_PUBLIC_APP_URL: 'https://staff.example.invalid', NODE_ENV: 'production',
    NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED: 'true',
  })) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => previous === undefined ? delete process.env[name] : process.env[name] = previous);
  }
}
const request = (data) => new Request('https://staff.example.invalid/api/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});

function fixture(t) {
  environment(t);
  const state = { user: null, delivery: true, emails: [], sessions: 0, conflict: false };
  const helpers = loadFile('lib/email-verification.ts', {
    '@/lib/notify': { sendEmail: async (...args) => {
      state.emails.push(args);
      return state.delivery ? { sent: true } : { sent: false, reason: 'Simulated delivery error' };
    } },
  });
  const users = {
    findFirst: async ({ where }) => state.user?.email.toLowerCase() === where.email.equals ? { ...state.user } : null,
    findUnique: async ({ where }) => where.id === 'actor'
      ? { role: 'ADMIN', status: 'ACTIVE', isApproved: true } : state.user && { ...state.user },
    create: async ({ data }) => {
      state.user = { id: 'staff', role: 'STAFF', status: 'PENDING', ...data };
      return { ...state.user };
    },
    updateMany: async ({ where, data }) => {
      if (state.conflict || !state.user) return { count: 0 };
      const user = state.user;
      if (where.id && where.id !== user.id) return { count: 0 };
      if (where.emailVerified !== undefined && where.emailVerified !== user.emailVerified) return { count: 0 };
      if (where.status?.not === user.status) return { count: 0 };
      if (where.verificationToken !== undefined && where.verificationToken !== user.verificationToken) return { count: 0 };
      if (where.tokenExpires instanceof Date || where.tokenExpires === null) {
        if (where.tokenExpires?.getTime() !== user.tokenExpires?.getTime()) return { count: 0 };
      } else if (where.tokenExpires?.gt && !(user.tokenExpires > where.tokenExpires.gt)) return { count: 0 };
      Object.assign(user, data);
      return { count: 1 };
    },
    update: async ({ data }) => { Object.assign(state.user, data); return { ...state.user }; },
  };
  const prisma = { user: users, $transaction: async (callback) => callback({ user: users }) };
  const mocks = {
    '@/lib/prisma': { prisma }, '@/lib/email-verification': helpers,
    '@/lib/session': {
      getSession: async () => ({ userId: 'actor', role: 'ADMIN' }),
      isPrivilegedRole: () => true,
      createSession: async () => { state.sessions++; },
    },
  };
  return {
    state, helpers,
    register: loadFile('app/api/auth/register/route.ts', mocks).POST,
    login: loadFile('app/api/auth/login/route.ts', mocks).POST,
    verify: loadFile('app/api/auth/verify/route.ts', mocks).GET,
    resend: loadFile('app/api/auth/resend-verification/route.ts', mocks).POST,
    approve: loadFile('app/api/admin/users/route.ts', mocks).PATCH,
  };
}
const registration = { name: '<img src=x>', email: '  Staff@Example.invalid ', pinCode: '5837' };
const credentials = { email: 'STAFF@example.invalid', pinCode: '5837' };
const verifyRequest = (token) => new Request(`https://staff.example.invalid/api/auth/verify?token=${token}`);

test('complete flow requires verification then admin approval before creating a session', async (t) => {
  const f = fixture(t);
  const startedAt = Date.now();
  const response = await f.register(request(registration));
  assert.equal(response.status, 201);
  assert.equal(f.state.user.email, 'staff@example.invalid');
  assert.equal(f.state.user.emailVerified, false);
  assert.equal(f.state.user.isApproved, false);
  const token = f.state.user.verificationToken;
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.ok(f.state.user.tokenExpires.getTime() >= startedAt + 86400000);
  assert.ok(f.state.user.tokenExpires.getTime() <= Date.now() + 86400000);
  assert.ok(!JSON.stringify(await response.json()).includes(token));
  assert.equal(f.state.emails.length, 1);
  assert.match(f.state.emails[0][2], /https:\/\/staff.example.invalid\/api\/auth\/verify\?token=/);
  assert.doesNotMatch(f.state.emails[0][2], /<img|localhost/);
  assert.equal((await f.login(request(credentials))).status, 403);
  assert.equal((await f.approve(request({ userId: 'staff', role: 'STAFF' }))).status, 409);
  assert.equal(f.state.sessions, 0);
  const verified = await f.verify(verifyRequest(token));
  assert.match(verified.headers.get('location'), /verify-email\?status=success$/);
  assert.equal(f.state.user.emailVerified, true);
  assert.equal(f.state.user.verificationToken, null);
  assert.equal(f.state.user.tokenExpires, null);
  assert.equal(f.state.user.isApproved, false);
  assert.equal((await f.login(request(credentials))).status, 403);
  assert.equal((await f.approve(request({ userId: 'staff', role: 'STAFF' }))).status, 200);
  assert.equal((await f.login(request(credentials))).status, 200);
  assert.equal(f.state.sessions, 1);
});

test('invalid input, duplicates and incorrect PIN never send emails or grant access', async (t) => {
  const f = fixture(t);
  for (const data of [null, {}, { ...registration, email: 123 }, { ...registration, name: {} },
    { ...registration, contactNumber: 12 }, { ...registration, pinCode: '1234' }]) {
    assert.equal((await f.register(request(data))).status, 400);
  }
  assert.equal(f.state.emails.length, 0);
  await f.register(request(registration));
  assert.equal((await f.register(request({ ...registration, email: 'STAFF@example.invalid' }))).status, 400);
  assert.equal((await f.login(request({ ...credentials, pinCode: '1111' }))).status, 401);
  assert.equal((await f.resend(request({ ...credentials, pinCode: '1111' }))).status, 401);
  assert.equal((await f.resend(request({ ...credentials, email: 'missing@example.invalid' }))).status, 401);
  assert.equal((await f.resend(request(null))).status, 400);
  assert.equal(f.state.emails.length, 1);
  assert.equal(f.state.sessions, 0);
});

test('delivery failure preserves account and supports resend recovery without re-registration', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture(t);
  f.state.delivery = false;
  const response = await f.register(request(registration));
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /account was saved/);
  assert.equal(f.state.user.emailVerified, false);
  assert.equal((await f.resend(request(credentials))).status, 429);
  f.state.user.tokenExpires = new Date(Date.now() + 86400000 - 61000);
  f.state.delivery = true;
  assert.equal((await f.resend(request(credentials))).status, 200);
  assert.equal(f.state.emails.length, 2);
});

test('resend rotates tokens, invalidates old links and prevents concurrent duplicate sends', async (t) => {
  const f = fixture(t);
  await f.register(request(registration));
  const old = f.state.user.verificationToken;
  const limited = await f.resend(request(credentials));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '60');
  f.state.user.tokenExpires = new Date(Date.now() - 1000);
  const responses = await Promise.all([f.resend(request(credentials)), f.resend(request(credentials))]);
  assert.equal(responses.filter((r) => r.status === 200).length, 1);
  assert.ok(responses.some((r) => [409, 429].includes(r.status)));
  assert.equal(f.state.emails.length, 2);
  assert.notEqual(f.state.user.verificationToken, old);
  assert.match((await f.verify(verifyRequest(old))).headers.get('location'), /status=invalid/);
  const token = f.state.user.verificationToken;
  const verification = await Promise.all([f.verify(verifyRequest(token)), f.verify(verifyRequest(token))]);
  assert.equal(verification.filter((r) => r.headers.get('location').endsWith('status=success')).length, 1);
});

test('expired, missing and malformed links redirect to recovery without verification', async (t) => {
  const f = fixture(t);
  await f.register(request(registration));
  f.state.user.tokenExpires = new Date(Date.now() - 1000);
  for (const token of ['', 'bad', f.state.user.verificationToken]) {
    assert.match((await f.verify(verifyRequest(token))).headers.get('location'), /status=invalid/);
  }
  assert.equal(f.state.user.emailVerified, false);
});

test('resend handles verified, inactive, delivery failure and conflicting accounts explicitly', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture(t);
  await f.register(request(registration));
  f.state.user.tokenExpires = null;
  f.state.user.verificationToken = null;
  f.state.conflict = true;
  assert.equal((await f.resend(request(credentials))).status, 409);
  f.state.conflict = false;
  f.state.delivery = false;
  assert.equal((await f.resend(request(credentials))).status, 502);
  f.state.user.status = 'INACTIVE';
  assert.equal((await f.resend(request(credentials))).status, 403);
  assert.equal((await f.login(request(credentials))).status, 403);
  f.state.user.status = 'PENDING';
  f.state.user.emailVerified = true;
  assert.equal((await f.resend(request(credentials))).status, 200);
  assert.equal(f.state.emails.length, 2);
});

test('production configuration fails before account creation without sender or HTTPS app URL', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture(t);
  process.env.NEXT_PUBLIC_APP_URL = '';
  assert.equal((await f.register(request(registration))).status, 500);
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  assert.throws(f.helpers.verificationConfig, /HTTPS/);
  process.env.NEXT_PUBLIC_APP_URL = 'https://staff.example.invalid';
  process.env.FROM_EMAIL = '';
  const oldAlias = process.env.EMAIL_FROM;
  delete process.env.EMAIL_FROM;
  t.after(() => { if (oldAlias !== undefined) process.env.EMAIL_FROM = oldAlias; });
  assert.throws(f.helpers.verificationConfig, /FROM_EMAIL/);
  assert.equal(f.state.user, null);
  assert.equal(f.state.emails.length, 0);
});

test('shared mail helper honors sender config and reports returned and thrown Resend errors', async (t) => {
  environment(t);
  let result = { error: null };
  let sent;
  let throws = false;
  const mail = loadFile('lib/notify.ts', {
    resend: { Resend: class {
      emails = { send: async (data) => {
        sent = data;
        if (throws) throw new Error('Network failed');
        return result;
      } };
    } },
  });
  assert.equal((await mail.sendEmail('staff@example.invalid', 'Test', '<p>Test</p>')).sent, true);
  assert.equal(sent.from, process.env.FROM_EMAIL);
  result = { error: { message: 'Sender not verified' } };
  assert.deepEqual(await mail.sendEmail('staff@example.invalid', 'Test', ''), { sent: false, reason: 'Sender not verified' });
  throws = true;
  assert.deepEqual(await mail.sendEmail('staff@example.invalid', 'Test', ''), { sent: false, reason: 'Network failed' });
});

test('verification pages explain success and recovery and offer resend only when needed', async (t) => {
  environment(t);
  const page = loadFile('app/verify-email/page.tsx', {
    'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
    '@/components/ResendVerificationForm': { default: () => React.createElement('form', null, 'Resend verification email') },
  }).default;
  for (const status of ['success', 'invalid', 'error', undefined]) {
    const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve({ status }) }));
    assert.equal(html.includes('Resend verification email'), status !== 'success');
    assert.match(html, /Back to sign in/);
    if (status === 'success') assert.match(html, /awaiting admin approval/);
    if (status === 'invalid') assert.match(html, /invalid, expired or already used/);
    if (status === 'error') assert.match(html, /could not verify/);
  }
});

test('unverified sign-ups remain removable but cannot be approved in the UI', () => {
  const component = loadFile('components/PendingUsersList.tsx', {
    'next/navigation': { useRouter: () => ({ refresh() {} }) },
  }).default;
  const html = renderToStaticMarkup(React.createElement(component, {
    initialUsers: [{ id: 'staff', name: 'Test', email: 'staff@example.invalid', emailVerified: false, createdAt: '' }],
  }));
  assert.match(html, /Awaiting email verification/);
  assert.match(html, /<button[^>]*>Remove<\/button>/);
  assert.doesNotMatch(html, /<button[^>]* disabled=""[^>]*>Remove<\/button>/);
  assert.match(html, /<button[^>]* disabled=""[^>]*>Approve Staff<\/button>/);
});

test('migration grandfathers only approved accounts and leaves new registrations unverified', () => {
  const sql = fs.readFileSync(path.join(root, 'prisma/migrations/20261028010000_email_verification_flow/migration.sql'), 'utf8');
  assert.match(sql, /"emailVerified" BOOLEAN NOT NULL DEFAULT false/);
  assert.match(sql, /SET "emailVerified" = true[\s\S]*WHERE "isApproved" = true/);
  assert.doesNotMatch(sql, /DROP|DELETE FROM/);
});

test('temporary bypass registers without email configuration and still requires admin approval', async (t) => {
  const f = fixture(t);
  delete process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED;
  for (const key of ['RESEND_API_KEY', 'FROM_EMAIL', 'NEXT_PUBLIC_APP_URL']) delete process.env[key];
  const response = await f.register(request(registration));
  assert.equal(response.status, 201);
  assert.match((await response.json()).message, /awaiting admin approval/);
  assert.equal(f.state.user.emailVerified, false);
  assert.equal(f.state.user.verificationToken, null);
  assert.equal(f.state.user.tokenExpires, null);
  assert.equal(f.state.user.isApproved, false);
  assert.equal(f.state.user.status, 'PENDING');
  assert.equal(f.state.emails.length, 0);
  assert.equal((await f.login(request(credentials))).status, 403);
  assert.equal(f.state.sessions, 0);
  assert.equal((await f.approve(request({ userId: 'staff', role: 'STAFF' }))).status, 200);
  assert.equal((await f.login(request(credentials))).status, 200);
  assert.equal(f.state.sessions, 1);
  assert.equal(f.state.user.emailVerified, false);
  assert.equal((await f.resend(request(credentials))).status, 503);
  assert.equal(f.state.emails.length, 0);
  process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED = 'true';
  assert.equal((await f.login(request(credentials))).status, 403);
  assert.equal(f.state.sessions, 1);
});

test('temporary bypass recovers previously saved unverified accounts without re-registration', async (t) => {
  const f = fixture(t);
  await f.register(request(registration));
  process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED = 'false';
  assert.equal((await f.approve(request({ userId: 'staff', role: 'STAFF' }))).status, 200);
  assert.equal((await f.login(request(credentials))).status, 200);
  f.state.user.status = 'INACTIVE';
  assert.equal((await f.login(request(credentials))).status, 403);
});

test('temporary bypass UI allows approval without claiming the email was verified', async (t) => {
  environment(t);
  process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED = 'false';
  const component = loadFile('components/PendingUsersList.tsx', {
    'next/navigation': { useRouter: () => ({ refresh() {} }) },
  }).default;
  const html = renderToStaticMarkup(React.createElement(component, {
    requireEmailVerification: false,
    initialUsers: [{ id: 'staff', name: 'Test', email: 'staff@example.invalid', emailVerified: false, createdAt: '' }],
  }));
  assert.match(html, /Email verification temporarily disabled/);
  assert.doesNotMatch(html, /<button[^>]* disabled=""[^>]*>Approve Staff<\/button>/);
  const page = loadFile('app/verify-email/page.tsx', {
    'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
    '@/components/ResendVerificationForm': { default: () => React.createElement('form', null, 'Resend verification email') },
  }).default;
  const recovery = renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }));
  assert.match(recovery, /account still needs admin approval/);
  assert.doesNotMatch(recovery, /Resend verification email/);
  for (const file of ['app/register/page.tsx', 'app/login/page.tsx']) {
    const Page = loadFile(file, {
      'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
      'next/navigation': { useRouter: () => ({ push() {} }) },
    }).default;
    const rendered = renderToStaticMarkup(React.createElement(Page));
    assert.doesNotMatch(rendered, /Resend verification email|verify your email/);
  }
});

test('mail helper loads without a Resend key and returns an explicit configuration error', async (t) => {
  environment(t);
  delete process.env.RESEND_API_KEY;
  const mail = loadFile('lib/notify.ts', {
    resend: { Resend: class { constructor() { throw new Error('Must not construct an unconfigured client'); } } },
  });
  assert.deepEqual(await mail.sendEmail('staff@example.invalid', 'Test', ''), {
    sent: false, reason: 'RESEND_API_KEY is not configured.',
  });
});
