/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript test loader. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(result.outputText, filename);
};
const { VENUE_SITES, isWithinOnsiteRange, getDistanceInMeters } = require('../lib/geo.ts');

test('Zushi Bento uses the business pin at 125 St Georges Terrace, not the old location', () => {
  assert.deepEqual(VENUE_SITES.ZB, [
    { lat: -31.9544448, lng: 115.8548311, radiusMeters: 200 },
  ]);
  assert.deepEqual(isWithinOnsiteRange(-31.9544448, 115.8548311, 'ZB'), {
    allowed: true, distanceMeters: 0, radiusMeters: 200,
  });
  const oldCentre = isWithinOnsiteRange(-31.9520, 115.8580, 'ZB');
  assert.equal(oldCentre.allowed, false);
  assert.ok(oldCentre.distanceMeters > 200);
});

test('Zushi Bento still enforces the 200 metre boundary near the store', () => {
  const inside = isWithinOnsiteRange(-31.95275, 115.8548311, 'ZB');
  const outside = isWithinOnsiteRange(-31.9525, 115.8548311, 'ZB');
  assert.equal(inside.allowed, true);
  assert.ok(inside.distanceMeters < 200);
  assert.equal(outside.allowed, false);
  assert.ok(outside.distanceMeters > 200);
  assert.equal(outside.radiusMeters, 200);
});

test('Sha locations and their existing 200 metre limits remain unchanged', () => {
  assert.deepEqual(VENUE_SITES.Sha, [
    { lat: -31.954819, lng: 115.854858, radiusMeters: 200 },
    { lat: -31.9056, lng: 115.9392, radiusMeters: 200 },
  ]);
  for (const site of VENUE_SITES.Sha) {
    assert.equal(isWithinOnsiteRange(site.lat, site.lng, 'Sha').allowed, true);
  }
  assert.equal(isWithinOnsiteRange(-32, 116, 'Sha').allowed, false);
  assert.equal(isWithinOnsiteRange(-32, 116, 'ZB').allowed, false);
  assert.equal(getDistanceInMeters(-31.9544448, 115.8548311, -31.9544448, 115.8548311), 0);
});
