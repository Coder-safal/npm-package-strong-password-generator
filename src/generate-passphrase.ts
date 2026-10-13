import type { PassphraseOptions } from './types.js';
import { NUMBERS, SYMBOLS } from './character-sets.js';
import { WORD_LIST } from './word-list.js';
import { bool, integer, MAX_SEPARATOR_LENGTH, MAX_WORD_LENGTH, MAX_WORD_LIST, MAX_WORDS, options, string } from './validation.js';
import { pick } from './random.js';
export function generatePassphrase(config: PassphraseOptions = {}): string {
    const o = options(config, ['words', 'separator', 'capitalize', 'numericSuffix', 'symbolSuffix', 'wordList']);
    const count = integer(o.words ?? 10, 'words', 1, MAX_WORDS);
    const separator = string(o.separator ?? '-', 'separator', MAX_SEPARATOR_LENGTH);
    const capitalize = bool(o.capitalize, 'capitalize', false);
    const numeric = bool(o.numericSuffix, 'numericSuffix', false);
    const symbol = bool(o.symbolSuffix, 'symbolSuffix', false);
    const input: unknown = o.wordList ?? WORD_LIST;
    if (!Array.isArray(input) || input.length < 1 || input.length > MAX_WORD_LIST)
        throw new RangeError(`wordList must contain 1 to ${MAX_WORD_LIST} words`);
    const words: string[] = [];
    for (const item of input) {
        const word = string(item, 'wordList entry', MAX_WORD_LENGTH);
        if (!word.length || /\s/u.test(word))
            throw new TypeError('Words must be nonempty and contain no whitespace');
        words.push(word);
    }
    const unique = [...new Set(words)];
    const normalized = capitalize ? [...new Set(unique.map(word => {
            const [first = '', ...rest] = Array.from(word);
            return first.toUpperCase() + rest.join('');
        }))] : unique;
    let result = Array.from({ length: count }, () => pick(normalized)).join(separator);
    if (numeric)
        result += pick(Array.from(NUMBERS));
    if (symbol)
        result += pick(Array.from(SYMBOLS));
    return result;
}
