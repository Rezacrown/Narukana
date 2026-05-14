---
name: narukana-integration-validate
description: Performs cross-layer consistency checking by cross-referencing UI actions and contract operations through the integration.md mapping file. Triggered by requests to validate integration consistency, check cross-layer references, or verify that mappings reference existing specs. Not triggered for validating the structure of integration.md itself or for single-layer deep-scan validation.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
None

## Procedure
1. Read `references/validation-rules.md` to understand validation methodology.
2. Run `bash scripts/check-integration.sh` to extract references from integration.md and cross-reference against ui.md and contract.json.
3. Review the script output for any "UNREFERENCED" entries.
4. Report all unreferenced items to the user and suggest whether the mapping or the source spec needs updating.

## Verification
- Script runs without errors
- Output lists any UNREFERENCED items found in integration mappings
- Clean run (no UNREFERENCED output) confirms cross-layer consistency

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-integration.sh` — Cross-references integration.md references against ui.md and contract.json. Usage: `bash scripts/check-integration.sh`

## Stop Conditions
- `.narukana/specs/integration.md` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- All items reported as UNREFERENCED — ui.md or contract.json may be missing or malformed
- False positives — inline code references that do not match spec names exactly
