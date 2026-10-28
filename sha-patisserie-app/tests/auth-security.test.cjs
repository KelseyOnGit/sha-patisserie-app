/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required for this isolated TypeScript loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

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
const { hashPin, verifyPin, isPinHash } = require('../lib/pins.ts');
const { staffListSelect, shiftUserSelect } = require('../lib/user-select.ts');
const body = (value) => new Request('http://localhost/api/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
});
function setEnv(t, name, value) {
  const previous = process.env[name];
  process.env[name] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

test('PIN hashes are salted, verify correctly and never accept plaintext or malformed hashes', async () => {
  const first = await hashPin('5837');
  const second = await hashPin('5837');
  assert.notEqual(first, second);
  assert.ok(isPinHash(first));
  assert.equal(await verifyPin('5837', first), true);
  assert.equal(await verifyPin('5838', first), false);
  assert.equal(await verifyPin('5837', '5837'), false);
  assert.equal(await verifyPin('5837', 'scrypt-v1$invalid$invalid'), false);
  assert.equal(await verifyPin('x'.repeat(10000), first), false);
  const leadingZero = await hashPin('0583');
  assert.equal(await verifyPin('0583', leadingZero), true);
  await assert.rejects(hashPin('123'), /4 to 6 digits/);
});

test('session configuration fails closed without a nonempty JWT secret', (t) => {
  const mocks = { jose: {}, 'next/headers': {}, '@/lib/prisma': {} };
  setEnv(t, 'JWT_SECRET', '');
  assert.throws(() => loadFile('lib/session.ts', mocks), /JWT_SECRET must be configured/);
  delete process.env.JWT_SECRET;
  assert.throws(() => loadFile('lib/session.ts', mocks), /JWT_SECRET must be configured/);
  process.env.JWT_SECRET = '   ';
  assert.throws(() => loadFile('lib/session.ts', mocks), /JWT_SECRET must be configured/);
  process.env.JWT_SECRET = 'test-secret-only-not-a-production-key';
  assert.equal(typeof loadFile('lib/session.ts', mocks).getSession, 'function');
});

test('PIN conversion preserves credentials, skips existing hashes and is repeatable', async (t) => {
  const existingHash = await hashPin('0583');
  const users = [{ id: 'legacy', pinCode: '5837' }, { id: 'hashed', pinCode: existingHash }];
  let writes = 0;
  const database = {
    user: { findMany: async () => users.map((user) => ({ ...user })) },
    $transaction: async (callback) => callback({ user: { updateMany: async ({ where, data }) => {
      const target = users.find((user) => user.id === where.id && user.pinCode === where.pinCode);
      if (!target) return { count: 0 };
      Object.assign(target, data);
      writes++;
      return { count: 1 };
    } } }),
  };
  const logs = [];
  t.mock.method(console, 'log', (text) => logs.push(text));
  const script = loadFile('scripts/hash-existing-pins.cjs', {
    '@prisma/client': { PrismaClient: class { constructor() { return database; } } },
  });
  await script.main([]);
  assert.equal(writes, 0);
  await script.main(['--apply']);
  assert.equal(writes, 1);
  assert.equal(await verifyPin('5837', users[0].pinCode), true);
  assert.equal(users[1].pinCode, existingHash);
  await script.main(['--apply']);
  assert.equal(writes, 1);
  assert.doesNotMatch(logs.join('\n'), /5837|0583|scrypt-v1/);
  users.push({ id: 'unsupported', pinCode: 'unsupported-format' });
  await assert.rejects(script.main(['--apply']), /Unsupported credential formats/);
  assert.equal(writes, 1);
});

test('production ignores GPS test mode while development may use it', (t) => {
  setEnv(t, 'NODE_ENV', 'production');
  setEnv(t, 'GPS_TEST_MODE', 'true');
  const geo = require('../lib/geo.ts');
  assert.equal(geo.isWithinOnsiteRange(-31.9056, 115.9392, 'Sha').allowed, false);
  assert.equal(geo.isWithinOnsiteRange(geo.STORE_LOCATIONS.Sha.lat, geo.STORE_LOCATIONS.Sha.lng, 'Sha').allowed, true);
  process.env.NODE_ENV = 'development';
  assert.equal(geo.isWithinOnsiteRange(-31.9056, 115.9392, 'Sha').allowed, true);
  process.env.GPS_TEST_MODE = 'false';
  assert.equal(geo.isWithinOnsiteRange(-31.9056, 115.9392, 'Sha').allowed, false);
});

test('registration stores a hash and does not return credentials', async () => {
  let saved;
  const route = loadFile('app/api/auth/register/route.ts', {
    '@/lib/prisma': { prisma: { user: {
      findFirst: async () => null,
      create: async ({ data }) => { saved = data; return { id: 'new', ...data }; },
    } } },
    '@/lib/email-verification': {
      verificationConfig: () => 'https://staff.example.invalid',
      verificationToken: () => ({ verificationToken: 'a'.repeat(64), tokenExpires: new Date(Date.now() + 86400000) }),
      sendVerificationEmail: async () => true,
    },
  });
  const response = await route.POST(body({ email: 'test@example.invalid', name: 'Test', pinCode: '5837' }));
  assert.equal(response.status, 201);
  assert.equal(await verifyPin('5837', saved.pinCode), true);
  const data = await response.json();
  assert.equal(data.user.pinCode, undefined);
});

test('login verifies hashes, preserves approval checks and rejects legacy plaintext', async () => {
  const user = { id: 'staff', email: 'test@example.invalid', role: 'STAFF', isApproved: true, status: 'ACTIVE', emailVerified: true, pinCode: await hashPin('5837') };
  let sessions = 0;
  const route = loadFile('app/api/auth/login/route.ts', {
    '@/lib/prisma': { prisma: { user: { findFirst: async () => user } } },
    '@/lib/session': { createSession: async () => { sessions++; } },
  });
  const login = (pinCode) => route.POST(body({ email: user.email, pinCode }));
  assert.equal((await login('5837')).status, 200);
  assert.equal((await login('5838')).status, 401);
  user.isApproved = false;
  assert.equal((await login('5837')).status, 403);
  user.isApproved = true;
  user.pinCode = '5837';
  assert.equal((await login('5837')).status, 401);
  assert.equal((await login(5837)).status, 400);
  assert.equal(sessions, 1);
});

test('user APIs restrict directory access, hash new PINs and allowlist every response', async () => {
  let role = 'STAFF';
  let writes = 0;
  const safe = { id: 'staff', name: 'Test' };
  const route = loadFile('app/api/users/route.ts', {
    '@/lib/session': {
      getSession: async () => ({ role }),
      isPrivilegedRole: (value) => ['ADMIN', 'MANAGER'].includes(value),
    },
    '@/lib/prisma': { prisma: { user: {
      findMany: async ({ select }) => { assert.deepEqual(select, staffListSelect); return [safe]; },
      create: async ({ data, select }) => {
        assert.equal(await verifyPin('5837', data.pinCode), true);
        assert.deepEqual(select, staffListSelect);
        writes++;
        return safe;
      },
      update: async ({ select }) => { assert.deepEqual(select, staffListSelect); return safe; },
    } } },
  });
  assert.equal((await route.GET()).status, 403);
  role = 'ADMIN';
  assert.deepEqual(await (await route.GET()).json(), [safe]);
  const response = await route.POST(body({ name: 'Test', email: 'test@example.invalid', pinCode: '5837' }));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), safe);
  assert.equal(writes, 1);
  assert.equal((await route.POST(body({ name: 'Test', email: 'test@example.invalid', pinCode: 'bad' }))).status, 400);
  assert.deepEqual(await (await route.PATCH(body({ userId: 'staff', location: 'SHA' }))).json(), safe);
  for (const select of [staffListSelect, shiftUserSelect]) {
    for (const field of ['pinCode', 'hourlyPayRate', 'claimTaxFreeThreshold', 'myobEmployeeId']) {
      assert.equal(select[field], undefined);
    }
  }
});
