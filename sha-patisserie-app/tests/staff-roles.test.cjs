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

test('dashboard attendance excludes inactive scheduled and unscheduled staff and their summary counts', async () => {
  const users = [
    { id: 'active', name: 'Active scheduled', role: 'STAFF', status: 'ACTIVE' },
    { id: 'manager', name: 'Active unscheduled', role: 'MANAGER', status: 'ACTIVE' },
    { id: 'inactive', name: 'Inactive scheduled', role: 'STAFF', status: 'INACTIVE' },
    { id: 'inactive-log', name: 'Inactive unscheduled', role: 'MANAGER', status: 'INACTIVE' },
  ];
  const shifts = [users[0], users[2]].map((user) => ({
    id: user.id, userId: user.id, user, location: { name: 'Sha Patisserie' },
    startTime: new Date('2020-10-05T01:00:00Z'), endTime: new Date('2020-10-05T07:00:00Z'),
  }));
  const logs = users.map((user) => ({
    id: user.id, userId: user.id, user, location: { name: 'Sha Patisserie' },
    clockIn: new Date('2020-10-05T01:00:00Z'), clockOut: null,
  }));
  const read = (records) => async ({ where }) => {
    assert.deepEqual(where.user.role, roles);
    assert.deepEqual(where.user.status, { not: 'INACTIVE' });
    return records.filter(({ user }) =>
      where.user.role.in.includes(user.role) && user.status !== where.user.status.not);
  };
  const api = route('admin/attendance', {
    shift: { findMany: read(shifts) }, timeLog: { findMany: read(logs) },
    leaveRequest: { findMany: async () => [] },
  });
  const response = await api.GET(new Request('http://localhost/api/admin/attendance?date=2020-10-05'));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.rows.map((row) => row.staffName), ['Active scheduled', 'Active unscheduled']);
  assert.equal(data.rows[0].id, 'shift-active');
  assert.equal(data.rows[1].scheduled, 'Unscheduled');
  assert.deepEqual(data.summary, { clockedIn: 2, onBreak: 0, late: 0, possibleAbsence: 0, scheduled: 0, completed: 0, onLeave: 0 });
  assert.equal(shifts.length, 2);
  assert.equal(logs.length, 4);
});

test('dashboard upcoming shifts exclude inactive staff while retaining active Staff/Managers', async () => {
  const api = route('admin/stats', {
    user: { count: async ({ where }) => {
      if (where.status) {
        assert.deepEqual(where, { status: 'ACTIVE', role: roles });
        return 2;
      }
      assert.deepEqual(where, { isApproved: false });
      return 1;
    } },
    shift: { count: async ({ where }) => {
      assert.deepEqual(where.user, { role: roles, status: { not: 'INACTIVE' } });
      const users = [
        { role: 'STAFF', status: 'ACTIVE' }, { role: 'MANAGER', status: 'ACTIVE' },
        { role: 'STAFF', status: 'INACTIVE' }, { role: 'ADMIN', status: 'ACTIVE' },
      ];
      return users.filter((user) => where.user.role.in.includes(user.role) &&
        user.status !== where.user.status.not).length;
    } },
  });
  assert.deepEqual(await (await api.GET()).json(), { totalStaff: 2, pendingUsers: 1, upcomingShifts: 2 });
});

test('roster time conversion is independent of server/browser timezone', () => {
  const { parseRosterTime, perthDateTime } = require('../lib/roster-time.ts');
  const previous = process.env.TZ;
  try {
    for (const zone of ['UTC', 'Australia/Perth', 'America/New_York']) {
      process.env.TZ = zone;
      assert.equal(parseRosterTime('2026-10-22T09:00').toISOString(), '2026-10-22T01:00:00.000Z');
      assert.equal(parseRosterTime('2026-10-22T15:00').toISOString(), '2026-10-22T07:00:00.000Z');
      assert.equal(perthDateTime('2026-10-22T01:00:00Z'), '2026-10-22T09:00');
      assert.equal(perthDateTime('2026-10-21T17:00:00Z'), '2026-10-22T01:00');
      for (const value of ['2026-10-22T09:00+08:00', '2026-10-22T01:00:00.000Z']) {
        assert.equal(parseRosterTime(value).toISOString(), '2026-10-22T01:00:00.000Z');
      }
      for (const invalid of [null, 123, '', 'invalid', '2026-10-22', '2026-10-22T25:00']) {
        assert.ok(Number.isNaN(parseRosterTime(invalid).getTime()));
      }
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

for (const method of ['POST', 'PUT']) {
  test(`${method} shifts saves timezone-free 9am-3pm input as Perth time`, async () => {
    let saved;
    const write = async ({ data }) => { saved = data; return { id: 'shift' }; };
    const api = route('shifts', {
      user: { findUnique: async () => ({ role: 'STAFF' }) },
      timesheet: { findUnique: async () => null },
      shift: { create: write, update: write },
    });
    for (const [startTime, endTime] of [
      ['2026-10-22T09:00', '2026-10-22T15:00'],
      ['2026-10-22T01:00:00Z', '2026-10-22T07:00:00Z'],
    ]) {
      const response = await api[method](request(method, { ...shiftBody, startTime, endTime }));
      assert.equal(response.status, method === 'POST' ? 201 : 200);
      assert.equal(saved.startTime.toISOString(), '2026-10-22T01:00:00.000Z');
      assert.equal(saved.endTime.toISOString(), '2026-10-22T07:00:00.000Z');
    }
    assert.equal((await api[method](request(method, {
      ...shiftBody, startTime: 'bad time',
    }))).status, 400);
  });
}

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
    assert.deepEqual(where.user.status, { not: 'INACTIVE' });
    return [];
  } } });
  const response = await api.POST(request('POST', weekBody));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 0);
});

test('inactive staff cannot receive new shifts or reassignments, but their old shifts can be corrected', async () => {
  let originalUserId = 'person';
  let writes = 0;
  const api = route('shifts', {
    user: { findUnique: async () => ({ role: 'STAFF', status: 'INACTIVE' }) },
    shift: {
      findUnique: async () => ({ userId: originalUserId, startTime: new Date('2020-10-05T01:00:00Z') }),
      update: async () => { writes++; return { id: 'shift' }; },
      create: async () => { throw new Error('Must not create a shift'); },
    },
    timesheet: { findUnique: async () => null },
  });
  const historic = { ...shiftBody, startTime: '2020-10-05T01:00:00Z', endTime: '2020-10-05T07:00:00Z' };
  assert.equal((await api.POST(request('POST', historic))).status, 400);
  assert.equal((await api.PUT(request('PUT', historic))).status, 200);
  originalUserId = 'another-person';
  assert.equal((await api.PUT(request('PUT', historic))).status, 400);
  originalUserId = 'person';
  assert.equal((await api.PUT(request('PUT', { ...historic,
    startTime: '2099-01-05T01:00:00Z', endTime: '2099-01-05T07:00:00Z',
  }))).status, 400);
  assert.equal(writes, 1);
});

test('publish excludes inactive staff in current/future weeks but permits historical corrections without emailing them', async () => {
  for (const [weekStart, historical] of [['2099-01-05', false], ['2020-10-05', true]]) {
    let updated = false;
    const api = route('roster/publish', {
      shift: {
        findMany: async ({ where }) => {
          assert.deepEqual(where.user.status, historical ? undefined : { not: 'INACTIVE' });
          return [{ id: 'old', userId: 'person' }];
        },
        updateMany: async ({ where }) => {
          assert.deepEqual(where.user.status, historical ? undefined : { not: 'INACTIVE' });
          updated = true;
          return { count: 1 };
        },
      },
      user: { findMany: async ({ where }) => {
        assert.deepEqual(where.status, { not: 'INACTIVE' });
        return [];
      } },
    });
    assert.equal((await api.POST(request('POST', { weekStart, location: 'SHA' }))).status, 200);
    assert.equal(updated, true);
  }
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
