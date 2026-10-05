import { generatePassword, estimatePasswordStrength } from '../src/index.js';
const password = generatePassword();
const strength = estimatePasswordStrength(password);
// Use password in your application; do not log or persist it here.
void strength;
