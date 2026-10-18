import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { transpileModule, ModuleKind } from 'typescript';
test('README JavaScript and CommonJS examples execute', () => {
  const readme = readFileSync('README.md', 'utf8');
  for (const block of readme.matchAll(/```(js|cjs)\n([\s\S]*?)```/gu)) {
    const code = block[2];
    if (code === undefined) throw new Error('Missing code example');
    execFileSync(process.execPath, ['--input-type=' + (block[1] === 'js' ? 'module' : 'commonjs'), '-e', code]);
  }
});
test('compiled standalone examples execute', () => {
  for (const example of ['basic', 'custom-policy', 'passphrase'])
    execFileSync(process.execPath, [`.test/examples/${example}.js`]);
});

test('TypeScript README example executes after compilation', () => {
  const snippet = readFileSync('README.md', 'utf8').match(/```ts\n([\s\S]*?)```/u)?.[1];
  if (!snippet) throw new Error('Missing TypeScript example');
  const {outputText} = transpileModule(snippet, {compilerOptions: {module: ModuleKind.ESNext}});
  execFileSync(process.execPath, ['--input-type=module', '-e', outputText]);
});
