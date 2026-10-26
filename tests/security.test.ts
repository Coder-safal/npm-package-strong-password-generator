import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pick, shuffle } from '../src/random.js';
test('random selection uses built-in unbiased crypto primitives only', () => {
  for (const file of readdirSync('src').filter(f => f.endsWith('.ts'))) {
    const source = readFileSync(`src/${file}`, 'utf8');
    assert.doesNotMatch(source, /Math\.random|console\.|node:fs|fetch\(/u);
  }
  const source = readFileSync('src/random.ts', 'utf8');
  assert.match(source, /from 'node:crypto'/u);
  assert.match(source, /randomInt\(items.length\)/u);
  assert.match(source, /randomInt\(i \+ 1\)/u);
  assert.throws(() => pick([]));
  assert.deepEqual(shuffle([1]), [1]);
  assert.deepEqual(shuffle([1,2,3,4]).sort(), [1,2,3,4]);
});
test('built ESM and CommonJS entry points load independently', async () => {
  const entry = '../../dist/esm/index.js';
  const esm: typeof import('../src/index.js') = await import(entry);
  assert.equal(esm.generatePassword().length, 24);
  const cjs: typeof import('../src/index.js') = createRequire(import.meta.url)('../../dist/cjs/index.js');
  assert.equal(cjs.generatePassword().length, 24);
});
test('conditional exports and declarations resolve for ESM and CommonJS consumers', () => {

    // Resolve through the package self-reference in files located in this project.
    for (const extension of ['mts', 'cts']) {
      const file = resolve(`.consumer-check.${extension}`);
      try {
        const snippet = readFileSync('README.md', 'utf8').match(/```ts\n([\s\S]*?)```/u)?.[1];
        if (!snippet) throw new Error('Missing TypeScript README example');
        writeFileSync(file, snippet);
        execFileSync(process.execPath, [createRequire(import.meta.url).resolve('typescript/bin/tsc'), '--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', file]);
      } finally { rmSync(file, {force: true}); }
    }
    for (const flag of ['module', 'commonjs']) {
      const script = flag === 'module' ? "import {generatePassword} from '@coder-safal/strong-password'; if(generatePassword().length!==24) process.exit(1)" : "if(require('@coder-safal/strong-password').generatePassword().length!==24) process.exit(1)";
      execFileSync(process.execPath, ['--input-type=' + flag, '-e', script]);
    }
});
test('selection bounds and crypto failures propagate through every generator', () => {
  const script = `
    import assert from 'node:assert/strict';
    import {createRequire, syncBuiltinESMExports} from 'node:module';
    const crypto = createRequire(import.meta.url)('node:crypto');
    crypto.randomInt = max => { assert.ok(Number.isInteger(max) && max > 0); return max - 1; };
    syncBuiltinESMExports();
    const {generatePassword, generatePassphrase, generateRandomString} = await import('./dist/esm/index.js');
    assert.equal(generateRandomString({length: 3, characters: 'aab'}), 'bbb');
    assert.equal(generatePassphrase({words: 2, wordList: ['first', 'last']}), 'last-last');
    assert.equal(generatePassword({length: 3, characters: 'xy'}), 'yyy');
    const {shuffle} = await import('./dist/esm/random.js');
    assert.deepEqual(shuffle([1,2,3]), [1,2,3]);
    crypto.randomInt = () => { throw new Error('crypto unavailable'); };
    syncBuiltinESMExports();
    for (const generate of [generatePassword, generatePassphrase, () => generateRandomString({characters: 'ab'})])
      assert.throws(() => generate(), /crypto unavailable/);
  `;
  execFileSync(process.execPath, ['--input-type=module', '-e', script]);
});
