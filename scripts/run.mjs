import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tsc = require.resolve('typescript/bin/tsc');
const node = (...args) => execFileSync(process.execPath, args, {stdio: 'inherit'});
const typecheck = () => node(tsc, '--noEmit');
const build = () => {
  node('scripts/clean.mjs');
  node(tsc, '-p', 'tsconfig.build.json');
  node(tsc, '-p', 'tsconfig.cjs.json');
  node('scripts/finish-build.mjs');
};
const test = () => {
  build();
  node(tsc, '-p', 'tsconfig.test.json');
  const files = readdirSync('.test/tests').filter(file => file.endsWith('.test.js'));
  node('--test', ...files.map(file => `.test/tests/${file}`));
};
const checkPackage = () => {
  node('scripts/check-package.mjs');
  node('scripts/verify-consumer.mjs');
};

switch (process.argv[2]) {
  case 'build': build(); break;
  case 'test': test(); break;
  case 'typecheck': typecheck(); break;
  case 'check:package': checkPackage(); break;
  case 'validate': typecheck(); test(); checkPackage(); break;
  default: throw new Error('Unknown development task');
}
