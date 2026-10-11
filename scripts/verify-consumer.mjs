import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pack, packageManager, runPackageManager } from './package-manager.mjs';
const folder = mkdtempSync(join(tmpdir(), 'strong-password-consumer-'));
try {
  const packed = pack(['--pack-destination', folder]);
  writeFileSync(join(folder, 'package.json'), '{"private":true}');
  const archive = resolve(folder, packed.filename);
  const args = packageManager === 'pnpm'
    ? ['add', '--ignore-scripts', '--store-dir', join(folder, 'store'), archive]
    : ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', join(folder, 'cache'), archive];
  runPackageManager(args, {cwd: folder});
  for (const format of ['module', 'commonjs']) {
    const load = format === 'module'
      ? "import * as api from 'strong-password';"
      : "const api = require('strong-password');";
    execFileSync(process.execPath, [`--input-type=${format}`, '-e', `${load}
      if(api.generatePassword().length !== 24) throw new Error('Password failed');
      if(api.generatePassphrase().split('-').length !== 10) throw new Error('Passphrase failed');
      if(api.generateRandomString({characters:'x',length:3}) !== 'xxx') throw new Error('Random string failed');
      if(api.estimatePasswordStrength('').estimatedBits !== 0) throw new Error('Estimator failed');
    `], {cwd: folder});
  }
  console.log(`Packed package installed with ${packageManager} and verified in an isolated ESM/CommonJS consumer.`);
} finally {
  rmSync(folder, {recursive: true, force: true});
}
