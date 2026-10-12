import type { PasswordStrength } from './types.js';
import { MAX_LENGTH, string } from './validation.js';
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
    let bits = chars.length * Math.log2(Math.max(1, size));
    const warnings = ['Heuristic only; does not model dictionary attacks, leaks, or cracking time.'];
    if (unique < chars.length / 2 || unique <= 1) {
        bits = Math.min(bits, unique * Math.log2(Math.max(1, size)));
        warnings.push('High repetition reduces the estimate.');
    }
    if (/password|qwerty|letmein|welcome|1234|abcd|admin/iu.test(password)) {
        bits = Math.min(bits, 20);
        warnings.push('Contains a common word or sequence.');
    }
    if (chars.length < 12)
        warnings.push('Use a longer independently generated secret.');
    return { category: bits < 28 ? 'very-weak' : bits < 50 ? 'weak' : bits < 80 ? 'moderate' : 'strong',
        length: chars.length, uniqueCharacters: unique, estimatedAlphabetSize: size,
        estimatedBits: Math.round(bits * 100) / 100, warnings };
}
