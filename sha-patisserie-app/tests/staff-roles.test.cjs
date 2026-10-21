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

function route(file, prisma, session = { userId: 'admin', role: 'ADMIN' }) {
  const filename = path.join(root, 'app', 'api', file, 'route.ts');
  const load = Module._load;
  delete require.cache[filename];
  Module._load = function (request, ...args) {
    if (request === '@/lib/prisma') return { prisma };
    if (request === '@/lib/session') return {
      getSession: async () => session,
      isPrivilegedRole: (role) => ['ADMIN', 'MANAGER'].includes(role),
    };
    if (request === '@/lib/notify') return {
      buildRosterMessage: () => 'Roster', sendEmail: async () => ({ sent: true }),
    };
    if (request === '@/lib/shiftConflicts') return {
      findShiftOnSameDay: async () => null, findOverlappingShift: async () => null,
    };
    return load.call(this, request, ...args);
  };
  try { return require(filename); }
  finally { Module._load = load; delete require.cache[filename]; }
}
const roles = { in: ['STAFF', 'MANAGER'] };
const request = (method, body) => new Request('http://localhost/api/test', {
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const shiftBody = {
  id: 'shift', userId: 'person', startTime: '2026-10-26T07:00:00+08:00',
  endTime: '2026-10-26T15:00:00+08:00', location: 'SHA', breakMinutes: 30,
};
const weekBody = { weekStart: '2026-10-26', location: 'SHA' };

test('staff list reads current roles and excludes Admin accounts after promotion', async () => {
  const person = { id: 'person', role: 'STAFF' };
  const api = route('users', { user: { findMany: async ({ where }) => {
    assert.deepEqual(where.role, roles);
    return where.role.in.includes(person.role) ? [person] : [];
  } } });
  assert.equal((await (await api.GET()).json()).length, 1);
  person.role = 'ADMIN';
  assert.deepEqual(await (await api.GET()).json(), []);
  person.role = 'MANAGER';
  assert.equal((await (await api.GET()).json()).length, 1);
});

test('shift lists exclude Admin accounts for both privileged and staff sessions', async () => {
  for (const role of ['ADMIN', 'STAFF']) {
    const api = route('shifts', { shift: { findMany: async ({ where }) => {
      assert.deepEqual(where.user.role, roles);
      if (role === 'STAFF') assert.deepEqual(where.publishedAt, { not: null });
      return [];
    } } }, { userId: 'viewer', role });
    assert.equal((await api.GET()).status, 200);
  }
});

for (const method of ['POST', 'PUT']) {
  test(`${method} shifts rejects Admin assignments and allows Staff and Managers`, async () => {
    let targetRole = 'ADMIN';
    let writes = 0;
    const write = async () => { writes++; return { id: 'shift' }; };
    const api = route('shifts', {
      user: { findUnique: async () => targetRole ? { role: targetRole } : null },
      timesheet: { findUnique: async () => null },
      shift: { create: write, update: write },
    });
    const rejected = await api[method](request(method, shiftBody));
    assert.equal(rejected.status, 400);
    assert.match((await rejected.json()).error, /Admin accounts cannot/);
    assert.equal(writes, 0);
    for (const role of ['STAFF', 'MANAGER']) {
      targetRole = role;
      assert.equal((await api[method](request(method, shiftBody))).status, method === 'POST' ? 201 : 200);
    }
    assert.equal(writes, 2);
    targetRole = null;
    assert.equal((await api[method](request(method, shiftBody))).status, 404);
    assert.equal(writes, 2);
  });
}

test('fill regular hours excludes Admin accounts', async () => {
  const api = route('roster/fill-regular', {
    location: { findUnique: async () => ({ id: 'venue' }) },
    user: { findMany: async ({ where }) => {
      assert.deepEqual(where.role, roles);
      assert.deepEqual(where.status, { not: 'INACTIVE' });
      return [];
    } },
  });
  assert.equal((await api.POST(request('POST', weekBody))).status, 200);
});

test('duplicate week excludes shifts belonging to Admin accounts', async () => {
  const api = route('roster/duplicate', { shift: { findMany: async ({ where }) => {
    assert.deepEqual(where.user.role, roles);
    return [];
  } } });
  const response = await api.POST(request('POST', weekBody));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 0);
});

test('publish filters Admin shifts and recipients without deleting history', async () => {
  let published = false;
  const api = route('roster/publish', {
    shift: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.user.role, roles);
        return [{ id: 'shift', userId: 'person' }];
      },
      updateMany: async ({ where }) => {
        assert.deepEqual(where.user.role, roles);
        published = true;
        return { count: 1 };
      },
    },
    user: { findMany: async ({ where }) => {
      assert.deepEqual(where.role, roles);
      return [{ id: 'person', name: 'Sam', email: null, shifts: [] }];
    } },
  });
  assert.equal((await api.POST(request('POST', weekBody))).status, 200);
  assert.equal(published, true);
});

test('dashboard staff and upcoming shift counts exclude Admin accounts', async () => {
  const api = route('admin/stats', {
    user: { count: async ({ where }) => {
      if (where.status) assert.deepEqual(where.role, roles);
      else assert.deepEqual(where, { isApproved: false });
      return 0;
    } },
    shift: { count: async ({ where }) => {
      assert.deepEqual(where.user.role, roles);
      return 0;
    } },
  });
  assert.equal((await api.GET()).status, 200);
});
