import { randomInt } from 'node:crypto';
export function pick<T>(items: readonly T[]): T {
    if (items.length === 0)
        throw new RangeError('Cannot select from an empty set');
    const item = items[randomInt(items.length)];
    if (item === undefined)
        throw new Error('Invalid selection');
    return item;
}
export function shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        const a = items[i];
        const b = items[j];
        if (a === undefined || b === undefined)
            throw new Error('Invalid shuffle input');
        items[i] = b;
        items[j] = a;
    }
    return items;
}
