import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword } from '../src/index.js';
import { AMBIGUOUS, LOWERCASE, NUMBERS, SYMBOLS, UPPERCASE } from '../src/character-sets.js';
test('default, explicit lengths, and all enabled groups', () => {
  for (const length of [4, 24, 32, 4096]) {
    const value = generatePassword({length});
    assert.equal(value.length, length);
    for (const group of [UPPERCASE, LOWERCASE, NUMBERS, SYMBOLS])
      assert.ok(Array.from(value).some(c => group.includes(c)));
  }
  assert.equal(generatePassword().length, 24);
});
test('each group independently', () => {
  for (const key of ['uppercase', 'lowercase', 'numbers', 'symbols'] as const) {
    const groups = {uppercase: false, lowercase: false, numbers: false, symbols: false, [key]: true};
    const set = {uppercase: UPPERCASE, lowercase: LOWERCASE, numbers: NUMBERS, symbols: SYMBOLS}[key];
    assert.ok(Array.from(generatePassword({...groups, length: 1})).every(c => set.includes(c)));
  }
});
test('exclusions and policy hold across repeated generation', () => {
  for (let i = 0; i < 200; i++) {
    const value = generatePassword({excludeAmbiguous: true, excludeCharacters: '!@abc', symbols: false});
    assert.ok(Array.from(value).every(c => !(AMBIGUOUS + '!@abc' + SYMBOLS).includes(c)));
    for (const group of [UPPERCASE, LOWERCASE, NUMBERS]) assert.ok(Array.from(value).some(c => group.includes(c)));
  }
});
test('minimum group count and custom Unicode alphabets', () => {
  assert.equal(generatePassword({length: 1, requiredCharacterGroups: 1}).length, 1);
  const value = generatePassword({characters: '😀🦊éé', length: 80, excludeCharacters: 'é'});
  assert.equal(Array.from(value).length, 80);
  assert.ok(Array.from(value).every(c => ['😀', '🦊'].includes(c)));
});
test('impossible policies fail', () => {
  for (const options of [
    {length: 3}, {uppercase: false, lowercase: false, numbers: false, symbols: false},
    {excludeCharacters: NUMBERS}, {requiredCharacterGroups: 5}, {requiredCharacterGroups: 0},
    {characters: ''}, {characters: 'abc', excludeCharacters: 'abc'},
    {characters: 'abc', symbols: false}, {characters: 'abc', requiredCharacterGroups: 1},
  ]) assert.throws(() => generatePassword(options));
});
