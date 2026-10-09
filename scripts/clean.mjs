import { rmSync } from 'node:fs';
for (const path of ['dist', '.test']) rmSync(path, { recursive: true, force: true });
