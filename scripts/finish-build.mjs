import { writeFileSync } from 'node:fs';
// The nested package boundary makes both .js and .d.ts unambiguously CommonJS.
writeFileSync('dist/cjs/package.json', '{"type":"commonjs"}\n');
