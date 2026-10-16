export interface PasswordOptions {
    length?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    /** Replaces built-in groups; cannot be combined with group switches or a group count. */
    characters?: string;
    excludeAmbiguous?: boolean;
    excludeCharacters?: string;
    /** Minimum distinct enabled groups; defaults to every enabled group. */
    requiredCharacterGroups?: number;
}
export interface RandomStringOptions {
    length?: number;
    characters: string;
}
export interface PassphraseOptions {
    words?: number;
    separator?: string;
    capitalize?: boolean;
    numericSuffix?: boolean;
    symbolSuffix?: boolean;
    wordList?: readonly string[];
}
export type StrengthCategory = 'very-weak' | 'weak' | 'moderate' | 'strong';
export interface PasswordStrength {
    category: StrengthCategory;
    length: number;
    uniqueCharacters: number;
    estimatedAlphabetSize: number;
    /** Length/alphabet model, penalized for repetition and simple patterns; not measured entropy. */
    estimatedBits: number;
    warnings: string[];
}
