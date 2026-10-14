import type { PasswordOptions } from './types.js';
import { AMBIGUOUS, LOWERCASE, NUMBERS, SYMBOLS, UPPERCASE } from './character-sets.js';
import { alphabet, bool, integer, MAX_ALPHABET_LENGTH, MAX_LENGTH, options, string } from './validation.js';
import { pick, shuffle } from './random.js';
export function generatePassword(config: PasswordOptions = {}): string {
    const o = options(config, ['length', 'uppercase', 'lowercase', 'numbers', 'symbols', 'characters', 'excludeAmbiguous', 'excludeCharacters', 'requiredCharacterGroups']);
    const length = integer(o.length ?? 24, 'length', 1, MAX_LENGTH);
    const excluded = new Set(Array.from(string(o.excludeCharacters ?? '', 'excludeCharacters', MAX_ALPHABET_LENGTH) +
        (bool(o.excludeAmbiguous, 'excludeAmbiguous', false) ? AMBIGUOUS : '')));
    let groups: string[][];
    if (o.characters !== undefined) {
        if (['uppercase', 'lowercase', 'numbers', 'symbols', 'requiredCharacterGroups'].some(key => key in o))
            throw new TypeError('characters cannot be combined with built-in group options');
        groups = [alphabet(o.characters)];
    }
    else {
        groups = ['uppercase', 'lowercase', 'numbers', 'symbols']
            .flatMap((key, i) => bool(o[key], key, true) ? [Array.from([UPPERCASE, LOWERCASE, NUMBERS, SYMBOLS][i] ?? '')] : []);
    }
    groups = groups.map(group => group.filter(char => !excluded.has(char)));
    if (!groups.length || groups.some(group => group.length === 0))
        throw new RangeError('Every enabled group must contain eligible characters');
    const required = integer(o.requiredCharacterGroups ?? groups.length, 'requiredCharacterGroups', 1, groups.length);
    if (length < required)
        throw new RangeError('length cannot satisfy required character groups');
    const chars = [...new Set(groups.flat())];
    const selected = shuffle([...groups]).slice(0, required).map(group => pick(group));
    while (selected.length < length)
        selected.push(pick(chars));
    return shuffle(selected).join('');
}
