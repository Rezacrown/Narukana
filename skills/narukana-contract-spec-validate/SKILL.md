---
name: narukana-contract-spec-validate
description: Validates the structure of contract.json and contract-detail.md specification files — checks for required JSON fields, schema version, operations array, and optional detail file presence. Triggered by requests to validate contract.json structure, check contract spec fields, verify JSON schema compliance, or ensure contract specs follow the required format. Not triggered for deep-scanning source code for contract operation implementations or for validating UI or integration specs.
---

## Detail
Validates the structure of `contract.json` — checks required fields (name, domain, operations), JSON validity, and transport-specific requirements (HTTP endpoints vs contract targets).

**Use when:**
- After editing `contract.json` to confirm correct format
- Before generating the plan to ensure specs are valid

**Do NOT use for:**
- Deep-scanning implementation evidence (use contract-validate)
- Editing spec files

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
None
- (free text, optional): additional instructions or context for this task

## Procedure
1. Read `references/validation-rules.md` to understand validation methodology.
- If the user provided additional instructions, incorporate them into your work.
2. Run `bash scripts/check-contract-json.sh` to validate contract.json structure (schemaVersion, name, operations) and optionally check contract-detail.md exists.
3. Review the output for any errors (prefixed with `✗`) or warnings (prefixed with `⚠`).
4. Report any structural issues to the user and suggest fixes.

## Verification
- Script runs without errors
- All required fields (schemaVersion, name, operations) are validated
- Each operation entry has at minimum a name field
- Warnings for missing optional fields are surfaced to the user

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-contract-json.sh` — Validates contract.json structure via Node.js (falls back to grep). Usage: `bash scripts/check-contract-json.sh`

## Stop Conditions
- `.narukana/specs/contract.json` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- Node.js not available — validation falls back to simple grep checks; user may see "Skipping deep validation" warning
- JSON parse error — contract.json is malformed; check file syntax
- WARN about missing contract-detail.md — optional; may or may not be needed for the project
