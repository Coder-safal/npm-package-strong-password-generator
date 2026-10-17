export const MAX_LENGTH = 4096;
export const MAX_ALPHABET_LENGTH = 65536;
export const MAX_WORDS = 128;
export const MAX_WORD_LIST = 65536;
export const MAX_WORD_LENGTH = 128;
export const MAX_SEPARATOR_LENGTH = 32;
export function integer(value: unknown, name: string, min: number, max: number): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
        throw new RangeError(`${name} must be an integer between ${min} and ${max}`);
    return value;
}
export function string(value: unknown, name: string, max: number): string {
    if (typeof value !== 'string')
        throw new TypeError(`${name} must be a string`);
    if (value.length > max)
        throw new RangeError(`${name} exceeds its maximum length of ${max} UTF-16 units`);
    // Reject lone surrogates, while accepting valid supplementary code points.
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value))
        throw new TypeError(`${name} must contain well-formed Unicode`);
    return value;
}
export function options(value: unknown, allowed: readonly string[]): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
        throw new TypeError('Options must be a plain object');
    for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string' || !allowed.includes(key))
            throw new TypeError('Unknown option');
        if (Object.getOwnPropertyDescriptor(value, key)?.get || Object.getOwnPropertyDescriptor(value, key)?.set)
            throw new TypeError('Option accessors are not supported');
        const item: unknown = Reflect.get(value, key);
        if (item === undefined || item === null)
            throw new TypeError(`${key} must not be undefined`);
    }
    return value as Record<string, unknown>;
}
export function bool(value: unknown, name: string, fallback: boolean): boolean {
    if (value === undefined)
        return fallback;
    if (typeof value !== 'boolean')
        throw new TypeError(`${name} must be a boolean`);
    return value;
}
export function alphabet(value: unknown): string[] {
    const result = [...new Set(Array.from(string(value, 'characters', MAX_ALPHABET_LENGTH)))];
    if (result.length === 0)
        throw new RangeError('Character set must not be empty');
    return result;
}
