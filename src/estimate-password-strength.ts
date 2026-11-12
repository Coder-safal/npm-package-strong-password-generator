import type { PasswordStrength } from './types.js';
import { MAX_LENGTH, string } from './validation.js';
const COMMON_PATTERNS = /password|qwerty|letmein|welcome|1234|abcd|admin/giu;
const PATTERN_BITS = 4;
export function estimatePasswordStrength(password: string): PasswordStrength {
    string(password, 'password', MAX_LENGTH * 2);
    const chars = Array.from(password);
    if (chars.length > MAX_LENGTH)
        throw new RangeError('password exceeds maximum code-point length');
    const unique = new Set(chars).size;
    let size = 0;
    if (/[a-z]/u.test(password))
        size += 26;
    if (/[A-Z]/u.test(password))
        size += 26;
    if (/[0-9]/u.test(password))
        size += 10;
    if (/[^a-zA-Z0-9]/u.test(password))
        size += 33;
    size = Math.max(size, unique);
    const perChar = Math.log2(Math.max(1, size));
    const n = chars.length;
    const warnings = ['Heuristic only; does not model dictionary attacks, leaks, or cracking time.'];
    // A character continuing a run of three or more identical characters adds almost nothing.
    const contributions = chars.map((char, i) => i >= 2 && char === chars[i - 1] && char === chars[i - 2] ? 1 : perChar);
    const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);
    const naive = n * perChar;
    // A common word or sequence is worth a small fixed cost instead of its full length,
    // so it weakens only its own part of the password rather than capping the whole score.
    let patterns = 0;
    for (const match of password.matchAll(COMMON_PATTERNS)) {
        const start = Array.from(password.slice(0, match.index)).length;
        const end = start + Array.from(match[0]).length;
        contributions.fill(0, start, end);
        contributions[start] = PATTERN_BITS;
        patterns++;
    }
    if (patterns)
        warnings.push('Contains a common word or sequence.');
    let bits = sum(contributions);
    // A string made of a repeated unit ("abcabcabc") is worth the unit plus the repeat count.
    for (let period = 1; period <= n / 2; period++) {
        if (n % period === 0 && chars.every((char, i) => char === chars[i % period])) {
            bits = Math.min(bits, sum(contributions.slice(0, period)) + Math.log2(n / period));
            break;
        }
    }
    // Only flag low diversity when far below what uniform random selection would produce,
    // so long secrets from small alphabets (digits, hex) are not penalized.
    const expectedUnique = size * (1 - (1 - 1 / Math.max(1, size)) ** n);
    if (unique <= 1 || unique < expectedUnique / 3)
        bits = Math.min(bits, unique * perChar);
    if (bits < naive)
        warnings.push('High repetition reduces the estimate.');
    if (chars.length < 12)
        warnings.push('Use a longer independently generated secret.');
    return { category: bits < 28 ? 'very-weak' : bits < 50 ? 'weak' : bits < 80 ? 'moderate' : 'strong',
        length: chars.length, uniqueCharacters: unique, estimatedAlphabetSize: size,
        estimatedBits: Math.round(bits * 100) / 100, warnings };
}
