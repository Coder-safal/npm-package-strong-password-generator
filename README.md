# npm-package-strong-password-generator

A lightweight, dependency-free password and passphrase generator for Node.js, written in strict TypeScript. Uses `node:crypto.randomInt()` for unbiased character and word selection and a cryptographic Fisher–Yates shuffle for password policies.

Initial development: **0.1.0**. No audit or certification is claimed. No runtime dependencies, telemetry, network requests, filesystem access, logging, or secret storage in the generator.

## Installation and compatibility

```bash
npm install @coder-safal/strong-password
# or
pnpm add @coder-safal/strong-password
```

The npm package name is `@coder-safal/strong-password`. npm rejected the unscoped name `strong-password` because it is too similar to the existing `strongpassword` package. These installation commands apply after a successful publication. Publishing requires an npm account with permission to use the `@coder-safal` scope.

Requires Node.js **22.23.3 or newer**. Locally verified on **22.23.3**; other versions are not claimed as tested. Core code targets Node.js, with no browser globals.

## Usage

ESM (also valid TypeScript):

```js
import { generatePassword, generatePassphrase, generateRandomString, estimatePasswordStrength } from '@coder-safal/strong-password';

const password = generatePassword(); // 24 characters; all four groups guaranteed
const phrase = generatePassphrase(); // 10 independently selected words
const token = generateRandomString({length: 32, characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'});
const strength = estimatePasswordStrength(password);
// Pass these values to your application; avoid logging secrets.
```

CommonJS:

```cjs
const { generatePassword, generatePassphrase } = require('@coder-safal/strong-password');
const password = generatePassword({length: 32});
const phrase = generatePassphrase({words: 10, separator: '-'});
```

TypeScript exports every public option and result type, with no default exports:

```ts
import { generatePassword, type PasswordOptions, type PasswordStrength, estimatePasswordStrength } from '@coder-safal/strong-password';
const policy: PasswordOptions = {length: 32, excludeAmbiguous: true};
const password = generatePassword(policy);
const result: PasswordStrength = estimatePasswordStrength(password);
```

## API reference

### `generatePassword(options?: PasswordOptions): string`

| Option | Default | Meaning |
| --- | --- | --- |
| `length` | `24` | Output Unicode code points, integer 1–4096 |
| `uppercase` | `true` | ASCII `A`–`Z` |
| `lowercase` | `true` | ASCII `a`–`z` |
| `numbers` | `true` | ASCII `0`–`9` |
| `symbols` | `true` | `!@#$%^&*()-_=+[]{};:,.?/~` |
| `excludeAmbiguous` | `false` | Remove `O0Il1` from every eligible set |
| `excludeCharacters` | `''` | Remove these code points |
| `requiredCharacterGroups` | All enabled groups | Minimum distinct groups, integer 1 through enabled group count |
| `characters` | Built-in groups | Custom alphabet replacing built-in groups |

All enabled groups must retain eligible characters after exclusions, even when requesting fewer required groups. Length must accommodate the minimum required groups. To disable a group, explicitly set its switch to `false`.

With `requiredCharacterGroups`, groups are securely shuffled and the requested number selected. One character is selected from each chosen group, remaining positions are drawn from the combined alphabet, and all positions are securely shuffled. This guarantees the minimum; additional groups can appear. Individual selections are unbiased, but policy-constrained complete passwords are **not uniformly distributed** over all valid strings. Do not use an unconstrained alphabet formula as an exact entropy claim for this algorithm.

Custom `characters` cannot be combined with any built-in group switch or `requiredCharacterGroups`; exclusions still apply. Duplicate code points are removed, so duplicates do not weight selection.

```js
import { generatePassword } from '@coder-safal/strong-password';
const long = generatePassword({length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true});
const withoutSymbols = generatePassword({length: 20, symbols: false});
const readable = generatePassword({length: 24, excludeAmbiguous: true, excludeCharacters: '!@'});
const twoGroups = generatePassword({length: 20, requiredCharacterGroups: 2});
const custom = generatePassword({length: 24, characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', excludeCharacters: 'A'});
const unicode = generatePassword({length: 16, characters: '😀🦊éλ'});
```

### `generateRandomString(options: RandomStringOptions): string`

`characters` is required. `length` defaults to 32 and must be an integer from 1–4096. Selection is independent and uniform over unique Unicode code points. Alphabet input is limited to 65,536 UTF-16 code units and must remain nonempty. A one-character alphabet is valid but entirely predictable. Small alphabets and short strings may be unsuitable for passwords or secrets.

```js
import { generateRandomString } from '@coder-safal/strong-password';
const value = generateRandomString({length: 32, characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'});
```

### `generatePassphrase(options?: PassphraseOptions): string`

| Option | Default | Meaning |
| --- | --- | --- |
| `words` | `10` | Integer 1–128 |
| `separator` | `'-'` | String up to 32 UTF-16 code units; empty allowed |
| `capitalize` | `false` | Uppercase the first Unicode code point of each word |
| `numericSuffix` | `false` | Append one independently selected ASCII digit |
| `symbolSuffix` | `false` | Append one independently selected built-in symbol, after the digit |
| `wordList` | Bundled vocabulary | Array of 1–65,536 nonempty words |

Words may repeat; sampling uses replacement. Every entry is validated before selection. Words cannot contain whitespace and are limited to 128 UTF-16 code units. Duplicate entries are removed. Capitalization uses JavaScript Unicode case mapping (which can expand a code point), and duplicates are removed again after capitalization. Custom lists are never mutated.

```js
import { generatePassphrase } from '@coder-safal/strong-password';
const phrase = generatePassphrase({words: 10, separator: '-', capitalize: true, numericSuffix: true, symbolSuffix: true});
const custom = generatePassphrase({words: 6, separator: ' ', wordList: ['cedar', 'river', 'amber', 'cloud']});
// This tiny custom list provides only 12 bits of word-selection entropy.
```

The bundled vocabulary in `src/word-list.ts` contains **340 unique lowercase words**, originally assembled for this project and distributed under its MIT license. No external corpus is used and no words are downloaded at runtime. Uniform independent selection of 10 words gives approximately `10 × log2(340) = 84.09` bits of selection entropy when word boundaries remain unambiguous. Six words give only 50.46 bits. For higher entropy, use more words or a larger trustworthy custom list. Tiny or biased lists substantially reduce security. Empty separators, words containing the separator, or capitalization collisions can reduce distinguishable outputs; prefer an unambiguous separator absent from the words. Deterministic capitalization adds no entropy. Suffixes do not compensate for a weak word list.

### `estimatePasswordStrength(password: string): PasswordStrength`

Accepts a well-formed Unicode string of at most 4096 code points (8192 UTF-16 code units). Empty strings are accepted. Returns:

| Field | Meaning |
| --- | --- |
| `category` | `very-weak` (<28 bits), `weak` (<50), `moderate` (<80), or `strong` |
| `length` | Unicode code-point count |
| `uniqueCharacters` | Distinct Unicode code points |
| `estimatedAlphabetSize` | Observed classes: 26 lowercase, 26 uppercase, 10 digits, 33 other; at least unique count |
| `estimatedBits` | Length × log2(alphabet size), reduced for heavy repetition and a few common patterns; rounded to two decimals |
| `warnings` | Explanations including the heuristic limitation |

**This is a heuristic, not measured entropy, a security guarantee, a cracking-time prediction, or a replacement for a reputable password-strength estimator.** It cannot reliably identify dictionaries, compromised passwords, human choices, or arbitrary patterns. The `strong` category does not certify safety. Use the actual generation process to reason about generated secrets.

## Validation and Unicode

All options must be plain objects with recognized own properties. Unknown keys, accessors, explicit `undefined` or `null` values, invalid booleans, wrong types, malformed Unicode, and impossible policies throw. Omit an option to use its default. Numeric inputs must be finite safe integers within their documented bounds. Invalid types generally throw `TypeError`; numeric bounds, empty alphabets, and impossible policies throw `RangeError`. Do not depend on exact error wording.

Custom alphabets, exclusions, password lengths, random-string lengths, and estimator lengths operate on **Unicode code points**, not UTF-16 units or grapheme clusters. Combining marks are separate selectable characters; no Unicode normalization is performed. Alphabet and exclusion input strings are each bounded to 65,536 UTF-16 units. Lone surrogates are rejected. JavaScript `.length` can exceed the requested output length for emoji; use `Array.from(value).length`.

No invalid option is silently ignored and no predictable fallback value is returned when generation fails. Errors do not include generated secrets. Crypto failures propagate to the caller. Bounds limit individual requests; applications should also manage request rates.

## Security considerations

All security-sensitive randomness comes from Node's `node:crypto.randomInt()`, which avoids modulo bias. Fisher–Yates uses a uniform index from 0 through the current position. Required groups are explicitly sampled; membership is never left to chance. Crypto API failures abort generation.

The implementation never logs, stores, or transmits secrets. Callers control subsequent handling. JavaScript strings cannot reliably be erased from memory; garbage collection and immutable strings prevent guaranteed zeroization. Avoid retaining secrets longer than necessary. This package does not implement hashing, password storage, authentication, or encryption.

Tests and algorithm review provide regression coverage; statistical tests cannot prove cryptographic security. No third-party security audit has been performed.

## Development and contributing

Both npm and pnpm are supported for installation, development, and package verification. Verified with npm 10.9.9 and pnpm 10.32.1. From a clean checkout with the supported Node.js version, choose one workflow.

Using npm:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run check:package
npm pack --dry-run
```

Using pnpm:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run build
pnpm run check:package
pnpm pack --dry-run
```

Both `package-lock.json` and `pnpm-lock.yaml` are included for reproducible installs. If you change dependencies, update both lockfiles (`npm install --package-lock-only` and `pnpm install --lockfile-only`). When switching package managers in the same checkout, remove `node_modules` before reinstalling to avoid mixing their installation layouts. No `packageManager` field forces either tool.

Build, test, and prepublish scripts use Node.js directly. Package checks use the package manager that launched the script, including packing and installing the tarball into a temporary consumer project. Running these check scripts directly with Node defaults to npm.

Only TypeScript and Node.js type declarations are direct development dependencies. Tests use Node's built-in test runner. `npm test` builds both module formats, compiles the tests and examples, and checks behavior, policy regressions, imports, consumer declarations, and documentation examples. `npm run clean` or `pnpm run clean` removes build and test output.

ESM lives in `dist/esm`; CommonJS lives in `dist/cjs`. A nested `package.json` declares `type: commonjs`, so both `.js` and `.d.ts` files there have CommonJS semantics without requiring `.cjs`/`.d.cts` renaming. Conditional exports select the correct code and declarations for each consumer.

Contributions should include a focused explanation, regression coverage for changed behavior, and successful checks above. Preserve zero runtime dependencies and the documented security policy. Never put credentials or generated secrets in issues or commits. Repository: [Coder-safal/npm-package-strong-password-generator](https://github.com/Coder-safal/npm-package-strong-password-generator). Confirm release ownership and npm account attribution before publication.

## Publishing

Publishing requires an explicit maintainer decision. Verify the npm name and account first:

```bash
npm view @coder-safal/strong-password name
npm login
npm whoami
```

Inspect a missing-package response: authentication, registry outages, or network failures do not establish availability. Check conflicts and trademarks. If the name cannot be registered, choose a name and update package metadata, lockfile, examples, tests, and documentation before release. For a scope, decide public access and use the appropriate `--access public` setting.

Run the development checks above and inspect `npm pack --dry-run` carefully. Only compiled JavaScript, declarations, the CommonJS package boundary, README, license, and package metadata should ship. Confirm maintainer identity and repository metadata. Update `CHANGELOG.md`, tag each release in Git, and never commit npm tokens or credentials.

Only after explicit release authorization:

```bash
npm publish --access public
npm view @coder-safal/strong-password version
```

Then install the release in a separate sample project with `npm install @coder-safal/strong-password` and test both ESM and CommonJS imports. `npm run check:package` or `pnpm run check:package` also packs and installs into a temporary sample project and checks both module formats; the temporary files are removed afterward.

Version 0.1.0 is for initial API development. Use semantic versioning: patch for compatible fixes, minor for compatible features, major for breaking changes. Stabilize the API and document limitations before 1.0.0.

## License

MIT; see [LICENSE](./LICENSE). The bundled word list is covered by the same license.
