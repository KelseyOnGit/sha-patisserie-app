/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required for this isolated TypeScript loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Prisma } = require('@prisma/client');

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
const body = (data) => new Request('http://localhost/api/admin/users', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});
function fixture() {
  const state = {
    session: { userId: 'actor', role: 'ADMIN' },
    actor: { role: 'ADMIN', isApproved: true, status: 'ACTIVE' },
    target: { role: 'STAFF', isApproved: false, status: 'PENDING' },
    admins: 2,
    writes: [],
  };
  const prisma = {
    $transaction: async (callback, options) => {
      assert.equal(options.isolationLevel, Prisma.TransactionIsolationLevel.Serializable);
      return callback({ user: {
        findUnique: async ({ where }) => where.id === 'actor' ? state.actor : state.target,
        count: async ({ where }) => {
          assert.deepEqual(where, { role: 'ADMIN', isApproved: true, status: 'ACTIVE' });
          return state.admins;
        },
        update: async ({ where, data, select }) => {
          assert.equal(select.pinCode, undefined);
          assert.equal(select.hourlyPayRate, undefined);
          state.writes.push(data);
          Object.assign(state.target, data);
          return { id: where.id, ...state.target };
        },
      } });
    },
  };
  const api = loadFile('app/api/admin/users/route.ts', {
    '@/lib/session': {
      getSession: async () => state.session,
      isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role),
    },
    '@/lib/prisma': { prisma },
  });
  return { api, state };
}

test('approval requires an explicit Staff/Admin choice and approves once', async () => {
  const { api, state } = fixture();
  for (const data of [null, {}, { userId: 'target' }, { userId: 'target', role: 'MANAGER' }, { userId: '', role: 'STAFF' }]) {
    assert.equal((await api.PATCH(body(data))).status, 400);
  }
  const response = await api.PATCH(body({ userId: 'target', role: 'ADMIN' }));
  assert.equal(response.status, 200);
  assert.deepEqual(state.writes, [{ role: 'ADMIN', isApproved: true, status: 'ACTIVE' }]);
  assert.equal((await api.PATCH(body({ userId: 'target', role: 'STAFF' }))).status, 409);
  assert.equal(state.writes.length, 1);
});

test('Managers may approve Staff but never assign, approve or remove Admin roles', async () => {
  const { api, state } = fixture();
  state.session.role = 'MANAGER';
  state.actor.role = 'MANAGER';
  assert.equal((await api.PATCH(body({ userId: 'target', role: 'ADMIN' }))).status, 403);
  assert.equal((await api.PUT(body({ userId: 'target', role: 'STAFF' }))).status, 403);
  state.target.role = 'ADMIN';
  assert.equal((await api.PATCH(body({ userId: 'target', role: 'STAFF' }))).status, 403);
  state.target.role = 'STAFF';
  assert.equal((await api.PATCH(body({ userId: 'target', role: 'STAFF' }))).status, 200);
  assert.deepEqual(state.writes, [{ role: 'STAFF', isApproved: true, status: 'ACTIVE' }]);
});

test('Staff and unauthenticated callers cannot approve or change roles', async () => {
  const { api, state } = fixture();
  for (const method of ['PATCH', 'PUT']) {
    state.session = null;
    assert.equal((await api[method](body({ userId: 'target', role: 'STAFF' }))).status, 401);
    state.session = { userId: 'actor', role: 'STAFF' };
    assert.equal((await api[method](body({ userId: 'target', role: 'STAFF' }))).status, 403);
  }
  assert.equal(state.writes.length, 0);
});

test('Admins can move approved accounts both ways without changing profile, status or records', async () => {
  const { api, state } = fixture();
  state.target = { role: 'STAFF', isApproved: true, status: 'INACTIVE', locationId: 'saved-venue', annualLeaveHours: 60 };
  assert.equal((await api.PUT(body({ userId: 'target', role: 'ADMIN' }))).status, 200);
  assert.equal((await api.PUT(body({ userId: 'target', role: 'STAFF' }))).status, 200);
  assert.deepEqual(state.writes, [{ role: 'ADMIN' }, { role: 'STAFF' }]);
  assert.equal(state.target.status, 'INACTIVE');
  assert.equal(state.target.locationId, 'saved-venue');
  assert.equal(state.target.annualLeaveHours, 60);
});

test('role changes protect self, last Admin, pending accounts and missing users', async () => {
  const { api, state } = fixture();
  assert.equal((await api.PUT(body({ userId: 'actor', role: 'STAFF' }))).status, 409);
  assert.equal((await api.PUT(body({ userId: 'target', role: 'ADMIN' }))).status, 409);
  state.target = { role: 'ADMIN', isApproved: true, status: 'ACTIVE' };
  state.admins = 1;
  assert.equal((await api.PUT(body({ userId: 'target', role: 'STAFF' }))).status, 409);
  state.target = null;
  assert.equal((await api.PUT(body({ userId: 'target', role: 'STAFF' }))).status, 404);
  assert.equal(state.writes.length, 0);
});

test('transaction rechecks actor permissions instead of trusting stale session roles', async () => {
  const { api, state } = fixture();
  state.actor.role = 'STAFF';
  assert.equal((await api.PATCH(body({ userId: 'target', role: 'ADMIN' }))).status, 403);
  assert.equal(state.writes.length, 0);
});

test('serialization conflicts surface as retryable errors', async () => {
  const api = loadFile('app/api/admin/users/route.ts', {
    '@/lib/session': { getSession: async () => ({ userId: 'actor', role: 'ADMIN' }), isPrivilegedRole: () => true },
    '@/lib/prisma': { prisma: { $transaction: async () => {
      throw new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: '6.19.3' });
    } } },
  });
  const response = await api.PUT(body({ userId: 'target', role: 'ADMIN' }));
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /Refresh and retry/);
});

test('alternate staff-creation endpoint cannot bypass Admin-only assignments', async () => {
  const api = loadFile('app/api/users/route.ts', {
    '@/lib/session': { getSession: async () => ({ role: 'MANAGER' }), isPrivilegedRole: () => true },
    '@/lib/prisma': { prisma: {} },
  });
  const response = await api.POST(body({ name: 'Test', email: 'test@example.invalid', pinCode: '5837', role: 'ADMIN' }));
  assert.equal(response.status, 403);
});

test('existing cookies use current database roles and disabled accounts lose access', async (t) => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'unit-test-secret-not-for-production';
  t.after(() => {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  });
  const user = { id: 'user', email: 'test@example.invalid', role: 'STAFF', isApproved: true, status: 'ACTIVE' };
  let failDatabase = false;
  const session = loadFile('lib/session.ts', {
    jose: { jwtVerify: async () => ({ payload: { userId: 'user', role: 'ADMIN' } }) },
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'test-cookie' }) }) },
    '@/lib/prisma': { prisma: { user: { findUnique: async ({ select }) => {
      assert.equal(select.pinCode, undefined);
      if (failDatabase) throw new Error('Database unavailable');
      return user;
    } } } },
  });
  assert.equal((await session.getSession()).role, 'STAFF');
  user.role = 'ADMIN';
  assert.equal((await session.getSession()).role, 'ADMIN');
  user.status = 'INACTIVE';
  assert.equal(await session.getSession(), null);
  user.status = 'ACTIVE';
  user.isApproved = false;
  assert.equal(await session.getSession(), null);
  failDatabase = true;
  await assert.rejects(session.getSession(), /Database unavailable/);
});

test('pending approval UI shows Admin selection only to Admins', () => {
  for (const canAssignAdmin of [true, false]) {
    const component = loadFile('components/PendingUsersList.tsx', {
      'next/navigation': { useRouter: () => ({ refresh() {} }) },
    }).default;
    const html = renderToStaticMarkup(React.createElement(component, {
      initialUsers: [{ id: 'pending', name: 'Test', email: 'test@example.invalid', createdAt: '' }],
      canAssignAdmin,
    }));
    assert.match(html, /Approve as/);
    assert.match(html, /value="STAFF"/);
    assert.equal(html.includes('value="ADMIN"'), canAssignAdmin);
  }
});

test('Admin Users list selects only safe Admin fields and offers demotion only for other accounts', async () => {
  const component = loadFile('app/admin/admin-users/page.tsx', {
    '@/lib/session': { getSession: async () => ({ userId: 'self', role: 'ADMIN' }) },
    '@/lib/prisma': { prisma: { user: { findMany: async ({ where, select }) => {
      assert.deepEqual(where, { role: 'ADMIN', isApproved: true });
      assert.deepEqual(Object.keys(select).sort(), ['email', 'id', 'name', 'status']);
      return [
        { id: 'self', name: 'My Admin', email: 'self@example.invalid', status: 'ACTIVE' },
        { id: 'other', name: 'Other Admin', email: 'other@example.invalid', status: 'ACTIVE' },
      ];
    } } } },
    '@/components/AccountRoleButton': { default: () => React.createElement('button', null, 'Move to Staff') },
  }).default;
  const html = renderToStaticMarkup(await component());
  assert.match(html, /Admin Users/);
  assert.match(html, /Your account/);
  assert.equal((html.match(/Move to Staff/g) || []).length, 1);
});

test('Admin Users page blocks Managers before reading Admin profiles', async () => {
  const component = loadFile('app/admin/admin-users/page.tsx', {
    '@/lib/session': { getSession: async () => ({ userId: 'manager', role: 'MANAGER' }) },
    'next/navigation': { redirect: () => { throw new Error('Redirected'); } },
    '@/lib/prisma': { prisma: {} },
  }).default;
  await assert.rejects(component(), /Redirected/);
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

function hookState() {
  const values = [];
  let index = 0;
  return {
    react: { ...React, useState(initial) {
      const position = index++;
      if (!(position in values)) values[position] = initial;
      return [values[position], (next) => { values[position] = typeof next === 'function' ? next(values[position]) : next; }];
    } },
    reset() { index = 0; },
  };
}

test('end profile confirms without submitting, cancel preserves status, and save persists inactivity without deleting history', async (t) => {
  const hooks = hookState();
  const effects = [];
  const saved = [];
  const apiWrites = [];
  const api = loadFile('app/api/admin/staff/update/route.ts', {
    '@/lib/session': {
      getSession: async () => ({ userId: 'admin', role: 'ADMIN' }),
      isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role),
    },
    '@/lib/prisma': { prisma: { user: { update: async ({ data }) => {
      apiWrites.push(data);
      return { id: 'person', status: data.status };
    } } } },
  });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (options?.method === 'POST') {
      saved.push(JSON.parse(options.body));
      return api.POST(new Request('http://localhost/api/admin/staff/update', options));
    }
    if (url.startsWith('/api/admin/staff/working-hours')) {
      return Response.json({ workingHoursPolicy: 'custom', workingHours: null });
    }
    assert.equal(url, '/api/admin/staff/update?userId=person');
    return Response.json({ canManageEmployment: true, user: {
      id: 'person', name: 'Test staff', email: 'test@example.invalid', status: 'ACTIVE',
      employmentType: 'CASUAL', annualLeaveHours: '0', personalLeaveHours: '0',
      hourlyPayRate: '30', rateLastUpdated: '', workingRightStatus: '', claimTaxFreeThreshold: null,
    } });
  });
  const previousWindow = globalThis.window;
  let confirmed = false;
  const prompts = [];
  globalThis.window = { confirm: (message) => { prompts.push(message); return confirmed; } };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  const Profile = loadFile('components/StaffProfile.tsx', {
    react: { ...hooks.react, useEffect: (setup) => effects.push(setup) },
  }).default;
  const render = () => { hooks.reset(); return Profile({ id: 'person' }); };
  render();
  effects.forEach((effect) => effect());
  await new Promise(setImmediate);
  findElement(render(), (node) => node.type === 'button' && node.props.children === 'Edit Profile').props.onClick();
  const end = () => findElement(render(), (node) => node.type === 'button' && node.props.children === 'End Profile');
  assert.equal(end().props.type, 'button');
  await end().props.onClick();
  assert.equal(findElement(render(), (node) => node.props.name === 'accountStatus').props.value, 'Active');
  assert.equal(saved.length, 0);
  confirmed = true;
  await end().props.onClick();
  assert.match(prompts[1], /Test staff/);
  assert.equal(saved.length, 0);
  assert.equal(findElement(render(), (node) => node.props.name === 'accountStatus').props.value, 'Inactive (Left Company)');
  await findElement(render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saved[0].userId, 'person');
  assert.equal(apiWrites[0].status, 'INACTIVE');
  assert.match(renderToStaticMarkup(render()), /Staff profile saved successfully/);
});

test('staff profiles default to active and combine name search with all status options', async (t) => {
  const people = [
    { id: 'active', name: 'Julia Active', email: 'active@example.invalid', status: 'ACTIVE', isApproved: true, location: null },
    { id: 'inactive', name: 'Julia Inactive', email: 'inactive@example.invalid', status: 'INACTIVE', isApproved: true, location: null },
    { id: 'pending', name: 'Vanessa Pending', email: 'pending@example.invalid', status: 'PENDING', isApproved: false, location: null },
    { id: 'unnamed', name: null, email: null, status: 'ACTIVE', isApproved: true, location: null },
  ];
  const hooks = hookState();
  const effects = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(options, undefined);
    if (url === '/api/users') return Response.json(people);
    if (url === '/api/auth/me') return Response.json({ user: { role: 'ADMIN' } });
    throw new Error(`Unexpected request: ${url}`);
  });
  const component = loadFile('app/admin/staff/page.tsx', {
    react: { ...hooks.react, useEffect: (setup) => { effects.push(setup); } },
    'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
    '@/components/AccountRoleButton': { default: () => React.createElement('button', null, 'Move to Admin') },
  }).default;
  const render = () => { hooks.reset(); return component(); };
  assert.match(renderToStaticMarkup(render()), /Loading staff members/);
  effects[0]();
  await new Promise(setImmediate);
  const names = () => {
    const body = findElement(render(), (node) => node.type === 'tbody');
    return body ? React.Children.toArray(body.props.children).map((fragment) =>
      findElement(fragment, (node) => node.type === 'tr' && node.props.className))
      .filter(Boolean).map((row) => findElement(row, (node) => node.type === 'td').props.children) : [];
  };
  const search = (value) => findElement(render(), (node) => node.props.type === 'search')
    .props.onChange({ target: { value } });
  const filter = (value) => findElement(render(), (node) => node.type === 'select' &&
    React.Children.toArray(node.props.children).some((option) => option.props.value === 'ALL'))
    .props.onChange({ target: { value } });
  assert.deepEqual(names(), ['Julia Active', 'Unnamed Staff']);
  search('  JULIA  ');
  assert.deepEqual(names(), ['Julia Active']);
  filter('INACTIVE');
  assert.deepEqual(names(), ['Julia Inactive']);
  filter('ALL');
  assert.deepEqual(names(), ['Julia Active', 'Julia Inactive']);
  search('');
  assert.deepEqual(names(), ['Julia Active', 'Vanessa Pending', 'Unnamed Staff', 'Julia Inactive']);
  assert.match(renderToStaticMarkup(render()), /Inactive staff/);
  const inactiveRow = findElement(render(), (node) => node.type === 'tr' &&
    renderToStaticMarkup(node).includes('Julia Inactive'));
  assert.match(inactiveRow.props.className, /bg-rose-50/);
  search('not found');
  assert.deepEqual(names(), []);
  assert.match(renderToStaticMarkup(render()), /No staff members match your search and status filter/);
  search('vanessa');
  filter('ACTIVE');
  assert.deepEqual(names(), []);
  filter('ALL');
  assert.deepEqual(names(), ['Vanessa Pending']);
  assert.doesNotMatch(renderToStaticMarkup(render()), /Move to Admin/);
  assert.equal(people[1].status, 'INACTIVE');
});

test('pending approval sends the chosen Admin role and displays API failures', async (t) => {
  const hooks = hookState();
  let refreshes = 0;
  let failure = true;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/admin/users');
    assert.equal(options.method, 'PATCH');
    assert.deepEqual(JSON.parse(options.body), { userId: 'pending', role: 'ADMIN' });
    return failure ? Response.json({ error: 'Account changed. Refresh.' }, { status: 409 }) : Response.json({ message: 'Approved' });
  });
  const component = loadFile('components/PendingUsersList.tsx', {
    react: hooks.react,
    'next/navigation': { useRouter: () => ({ refresh() { refreshes++; } }) },
  }).default;
  const props = { initialUsers: [{ id: 'pending', name: 'Test', email: 'test@example.invalid', createdAt: '' }], canAssignAdmin: true };
  const render = () => { hooks.reset(); return component(props); };
  findElement(render(), (node) => node.type === 'select').props.onChange({ target: { value: 'ADMIN' } });
  t.mock.method(console, 'error', () => {});
  await findElement(render(), (node) => node.type === 'button').props.onClick();
  assert.match(renderToStaticMarkup(render()), /Account changed. Refresh./);
  assert.equal(refreshes, 0);
  failure = false;
  await findElement(render(), (node) => node.type === 'button').props.onClick();
  assert.match(renderToStaticMarkup(render()), /No users are currently awaiting approval/);
  assert.equal(refreshes, 1);
});

test('role-change button confirms changes, reports errors and refreshes only on success', async (t) => {
  const previousWindow = globalThis.window;
  let confirm = false;
  globalThis.window = { confirm: () => confirm };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  const hooks = hookState();
  let refreshes = 0;
  let moved = 0;
  let calls = 0;
  let failure = true;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls++;
    assert.equal(url, '/api/admin/users');
    assert.equal(options.method, 'PUT');
    assert.deepEqual(JSON.parse(options.body), { userId: 'target', role: 'STAFF' });
    return failure ? Response.json({ error: 'Cannot demote.' }, { status: 409 }) : Response.json({ message: 'Moved' });
  });
  const component = loadFile('components/AccountRoleButton.tsx', {
    react: hooks.react,
    'next/navigation': { useRouter: () => ({ refresh() { refreshes++; } }) },
  }).default;
  const render = () => {
    hooks.reset();
    return component({ userId: 'target', name: 'Test', role: 'STAFF', onMoved: () => { moved++; } });
  };
  await findElement(render(), (node) => node.type === 'button').props.onClick();
  assert.equal(calls, 0);
  confirm = true;
  await findElement(render(), (node) => node.type === 'button').props.onClick();
  assert.match(renderToStaticMarkup(render()), /Cannot demote/);
  assert.equal(moved, 0);
  failure = false;
  await findElement(render(), (node) => node.type === 'button').props.onClick();
  assert.equal(moved, 1);
  assert.equal(refreshes, 1);
});
