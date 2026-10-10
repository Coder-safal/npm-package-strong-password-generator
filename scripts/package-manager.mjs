import { execFileSync } from 'node:child_process';

// npm and pnpm both provide their CLI path to lifecycle scripts.
const cli = process.env.npm_execpath;
export const packageManager = process.env.npm_config_user_agent?.startsWith('pnpm/') ? 'pnpm' : 'npm';
export function runPackageManager(args, options = {}) {
  const command = cli ? process.execPath : packageManager;
  return execFileSync(command, cli ? [cli, ...args] : args, {
    ...options,
    encoding: 'utf8',
    env: {...process.env, npm_config_ignore_scripts: 'true'},
  });
}
export function pack(args = []) {
  const result = JSON.parse(runPackageManager(['pack', '--json', ...args]));
  // npm returns an array; pnpm returns a single package object.
  return Array.isArray(result) ? result[0] : result;
}
