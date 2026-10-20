import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRandomString } from '../src/index.js';
test('length, membership, defaults, deduplication, Unicode code points', () => {
  assert.equal(generateRandomString({characters: 'x'}), 'x'.repeat(32));
  const result = Array.from(generateRandomString({length: 100, characters: '😀ééx'}));
  assert.equal(result.length, 100);
  assert.ok(result.every(c => ['😀', 'é', 'x'].includes(c)));
});
test('invalid alphabets and length bounds', () => {
  for (const characters of ['', '\ud800', '\udfff', 'a'.repeat(65537)])
    assert.throws(() => generateRandomString({characters}));
  for (const length of [NaN, Infinity, -1, 0, 1.5, 4097, Number.MAX_SAFE_INTEGER])
    assert.throws(() => generateRandomString({length, characters: 'a'}));
});
