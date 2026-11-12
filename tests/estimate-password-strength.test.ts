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
test('random secrets from small alphabets are not treated as repetition', () => {
  const pin = '8302917465' + '1938274650' + '5729301846' + '0461927385';
  const result = estimatePasswordStrength(pin);
  assert.equal(result.category, 'strong');
  assert.ok(!result.warnings.some(w => w.includes('repetition')));
  assert.equal(estimatePasswordStrength('3f9a0c7e1b5d2864e0a9c3f7b1d5e2a8').category, 'strong');
});
test('repeated units and long runs are still penalized', () => {
  assert.equal(estimatePasswordStrength('a'.repeat(40)).category, 'very-weak');
  assert.equal(estimatePasswordStrength('ab'.repeat(20)).category, 'very-weak');
  assert.equal(estimatePasswordStrength('xyz7'.repeat(10)).category, 'very-weak');
  assert.ok(estimatePasswordStrength('Kq9#zzzzzzzzzzzz').warnings.some(w => w.includes('repetition')));
});
test('a common word weakens only its own part of a long password', () => {
  const random = 'vQ8!mZ2@pL7#rT5$wX3%nB6^';
  const result = estimatePasswordStrength(random + 'admin');
  assert.equal(result.category, 'strong');
  assert.ok(result.warnings.some(w => w.includes('common')));
  assert.ok(result.estimatedBits < estimatePasswordStrength(random + 'Hx4&j').estimatedBits);
  assert.equal(estimatePasswordStrength('admin1234').category, 'very-weak');
  assert.equal(estimatePasswordStrength('Password!').category, 'very-weak');
});
