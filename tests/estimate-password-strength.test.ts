import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePasswordStrength } from '../src/index.js';
test('documented metadata, repetition and patterns', () => {
  const empty = estimatePasswordStrength('');
  assert.equal(empty.length, 0);
  assert.equal(empty.estimatedBits, 0);
  assert.equal(empty.category, 'very-weak');
  assert.ok(estimatePasswordStrength('aaa').estimatedBits < 10);
  assert.equal(estimatePasswordStrength('password1234!').category, 'very-weak');
  const result = estimatePasswordStrength('vQ8!mZ2@pL7#rT5$');
  assert.equal(result.category, 'strong');
  assert.equal(typeof result.estimatedAlphabetSize, 'number');
  assert.equal(typeof result.uniqueCharacters, 'number');
  assert.ok(result.warnings.some(w => w.includes('Heuristic')));
  assert.equal(estimatePasswordStrength('😀🦊').length, 2);
  assert.throws(() => estimatePasswordStrength('a'.repeat(4097)));
});
