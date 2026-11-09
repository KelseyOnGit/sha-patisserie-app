/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { buildRosterMessage } = require('../lib/notify.ts');
const shift = (day, hour = '06') => ({
  startTime: `2026-11-${day}T${hour}:00:00+08:00`,
  endTime: `2026-11-${day}T14:30:00+08:00`,
});
const dates = (html) => [...html.matchAll(/font-weight: bold;">([^<]+)<\/td>/g)]
  .map((match) => match[1]);

test('roster email sorts shuffled weekdays chronologically without mutating the input', () => {
  const shifts = ['18', '19', '17', '20', '16'].map((day) => shift(day));
  const original = [...shifts];
  assert.deepEqual(dates(buildRosterMessage('Staff', shifts)),
    ['Mon, 16/11', 'Tue, 17/11', 'Wed, 18/11', 'Thu, 19/11', 'Fri, 20/11']);
  assert.deepEqual(shifts, original);
});

test('roster email sorts same-day shifts by start time and accepts Date objects', () => {
  const early = shift('16');
  const shifts = [shift('16', '10'), {
    startTime: new Date(early.startTime), endTime: new Date(early.endTime),
  }];
  const html = buildRosterMessage('Staff', shifts);
  assert.ok(html.indexOf('6:00 am') < html.indexOf('10:00 am'));
  assert.deepEqual(dates(html), ['Mon, 16/11', 'Mon, 16/11']);
});

test('roster email sorts across month boundaries and preserves Perth dates', () => {
  const shifts = [
    { startTime: '2026-12-01T22:00:00Z', endTime: '2026-12-02T06:30:00Z' },
    { startTime: '2026-11-29T22:00:00Z', endTime: '2026-11-30T06:30:00Z' },
    { startTime: '2026-11-30T22:00:00Z', endTime: '2026-12-01T06:30:00Z' },
  ];
  assert.deepEqual(dates(buildRosterMessage('Staff', shifts)),
    ['Mon, 30/11', 'Tue, 01/12', 'Wed, 02/12']);
});

test('empty roster email retains the no-shifts message', () => {
  assert.match(buildRosterMessage(null, []), /Hi Team Member.*no shifts scheduled/s);
});
