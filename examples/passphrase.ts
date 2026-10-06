import { generatePassphrase } from '../src/index.js';
const phrase = generatePassphrase({words: 10, separator: '-', capitalize: true});
void phrase;
