import type { RandomStringOptions } from './types.js';
import { alphabet, integer, MAX_LENGTH, options } from './validation.js';
import { pick } from './random.js';
export function generateRandomString(config: RandomStringOptions): string {
    const o = options(config, ['length', 'characters']);
    const length = integer(o.length ?? 32, 'length', 1, MAX_LENGTH);
    const chars = alphabet(o.characters);
    return Array.from({ length }, () => pick(chars)).join('');
}
