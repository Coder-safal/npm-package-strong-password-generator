import { generatePassword, generateRandomString } from '../src/index.js';
const password = generatePassword({length: 32, excludeAmbiguous: true, excludeCharacters: '!@', symbols: false});
const token = generateRandomString({length: 32, characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'});
void password;
void token;
