---
name: narukana-contract-validate
description: Deep-scans the source code to verify that every contract operation declared in contract.json has a corresponding implementation in Solidity, Rust, Cairo, or Vyper files. Triggered by requests to validate contract operations against source code, check smart contract implementation coverage, or verify contract spec completeness. Not triggered for validating the JSON structure of contract.json or for checking UI or integration specs.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `--source-dir <path>`: Contract source directory to scan (default: `contracts`)

## Procedure
1. Read `references/validation-rules.md` to understand validation methodology.
2. Run `bash scripts/check-contract-ops.sh [source-dir]` to extract operation names from contract.json and scan contract source files for each.
3. Review the script output for any "MISSING" entries.
4. Report all missing contract operations to the user with operation names and suggest next steps.

## Verification
- Script runs without errors
- Output lists every operation as either FOUND or MISSING
- MISSING operations are clearly reported to the user

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-contract-ops.sh` — Extracts operation names from `.narukana/specs/contract.json` and greps source code. Usage: `bash scripts/check-contract-ops.sh [source-dir]`

## Stop Conditions
- `.narukana/specs/contract.json` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- JSON parse errors — contract.json may be malformed; validate with `narukana-contract-spec-validate` first
- No source files found — verify the contracts directory path is correct
