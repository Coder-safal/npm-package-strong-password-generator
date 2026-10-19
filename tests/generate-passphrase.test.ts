import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassphrase } from '../src/index.js';
import { WORD_LIST } from '../src/word-list.js';
import { SYMBOLS } from '../src/character-sets.js';
test('default list, counts, capitalization, separators and suffixes', () => {
  assert.equal(generatePassphrase().split('-').length, 10);
  assert.equal(new Set(WORD_LIST).size, WORD_LIST.length);
  assert.ok(WORD_LIST.length >= 256);
  const value = generatePassphrase({words: 6, separator: ':', capitalize: true, numericSuffix: true, symbolSuffix: true});
  const words = value.slice(0, -2).split(':');
  assert.equal(words.length, 6);
  assert.ok(words.every(w => WORD_LIST.includes(w.toLowerCase()) && /^[A-Z]/u.test(w)));
  assert.match(value.slice(-2, -1), /^[0-9]$/u);
  assert.ok(SYMBOLS.includes(value.slice(-1)));
});
test('custom lists, duplicates, repetition and Unicode', () => {
  assert.equal(generatePassphrase({wordList: ['éclair', 'éclair'], words: 3, capitalize: true, separator: '😀'}), 'Éclair😀Éclair😀Éclair');
  const words = generatePassphrase({wordList: ['first', 'last'], words: 128}).split('-');
  assert.ok(words.every(w => ['first', 'last'].includes(w)));
});
test('invalid list entries, bounds, and flags fail', () => {
  for (const wordList of [[], [''], ['has space'], ['\ud800'], ['a'.repeat(129)], Array(65537).fill('a')])
    assert.throws(() => generatePassphrase({wordList}));
  for (const words of [0, -1, 1.5, NaN, Infinity, 129]) assert.throws(() => generatePassphrase({words}));
  assert.throws(() => generatePassphrase({separator: 'a'.repeat(33)}));
});
