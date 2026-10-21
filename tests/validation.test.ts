import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword, generatePassphrase, generateRandomString, estimatePasswordStrength } from '../src/index.js';
test('untyped callers cannot silently weaken policies', () => {
  const password: (o: unknown) => string = o => Reflect.apply(generatePassword, undefined, [o]) as string;
  const passphrase: (o: unknown) => string = o => Reflect.apply(generatePassphrase, undefined, [o]) as string;
  for (const value of [null, 1, [], 'x', {length: null}, {length: undefined}, {length: '24'}, {symbols: 'false'}, {unknown: true}, {[Symbol()]: true}, {get length() {return 24;}}])
    assert.throws(() => password(value));
  for (const length of [NaN, Infinity, -Infinity, 0, -1, 1.1, 4097]) assert.throws(() => password({length}));
  for (const value of [{capitalize: 1}, {numericSuffix: 'true'}, {wordList: [1]}, {wordList: new Array(2)}, {words: null}])
    assert.throws(() => passphrase(value));
  assert.throws(() => Reflect.apply(generateRandomString, undefined, [{}]));
  assert.throws(() => Reflect.apply(estimatePasswordStrength, undefined, [12]));
});
