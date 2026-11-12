# Changelog

## 0.1.1 — Unreleased

- Fix `estimatePasswordStrength` underrating long random secrets from small alphabets (digits, hex); repetition is now detected from long runs, repeated units and far-below-random diversity.
- Fix `estimatePasswordStrength` capping any password containing a common word or sequence at 20 bits; a match now only reduces the bits of its own characters.
- Relax the Node.js engine requirement from `>=22.23.3` to `>=22.0.0`.

## 0.1.0 — 2026-10-27

- Add cryptographic passwords, random strings, and passphrases.
- Add strict configuration validation, Unicode code-point alphabets, exclusions and required groups.
- Add a documented heuristic strength estimator and dual ESM/CommonJS builds.
