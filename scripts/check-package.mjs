import assert from 'node:assert/strict';
import { pack, packageManager } from './package-manager.mjs';
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies'])
  assert.equal(Object.keys(pkg[field] ?? {}).length, 0, `${field} must be empty`);
const contents = pack(['--dry-run']);
const paths = contents.files.map(file => file.path);
for (const path of paths) assert.match(path, /^(?:dist\/(?:esm|cjs)\/[a-z-]+\.(?:js|d\.ts)|dist\/cjs\/package\.json|README\.md|LICENSE|package\.json)$/u);
for (const path of ['dist/esm/index.js', 'dist/esm/index.d.ts', 'dist/cjs/index.js', 'dist/cjs/index.d.ts', 'dist/cjs/package.json', 'README.md', 'LICENSE'])
  assert.ok(paths.includes(path), `Missing package file: ${path}`);
console.log(`Verified ${paths.length} ${packageManager} package files; zero runtime dependencies.`);
