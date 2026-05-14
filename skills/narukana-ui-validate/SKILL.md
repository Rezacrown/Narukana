---
name: narukana-ui-validate
description: Deep-scans the source code to verify that every UI action declared in the ui.md spec has a corresponding implementation. Triggered by requests to validate UI actions against source code, check if UI features are implemented, or verify UI spec coverage. Not triggered for validating the structure of the ui.md file itself or for checking contract/integration specs.
---

# Narukana UI Validate

## Detail
Deep-scans the source code to verify that UI actions declared in the spec actually exist in the implementation. Reports missing actions and their locations.

**Use when:**
- Auditing UI implementation against the spec
- Checking if all required UI actions are implemented

**Do NOT use for:**
- Validating spec file structure (use ui-spec-validate)
- Editing or creating spec files

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--source-dir <path>`: Source code directory to scan (default: `src`)
- (free text, optional): additional instructions or context for this task

## Procedure
1. Read `references/validation-rules.md` to understand validation methodology.
- If the user provided additional instructions, incorporate them into your work.
2. Run `bash scripts/check-ui-actions.sh [source-dir]` to grep UI action names from the spec and scan source code for each.
3. Review the script output for any "MISSING" entries.
4. Report all missing UI actions to the user with action names and suggest next steps.

## Verification
- Script runs without errors
- Output lists every action as either FOUND or MISSING
- MISSING actions are clearly reported to the user

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-ui-actions.sh` — Extracts action names from `.narukana/specs/ui.md` and greps source code for each. Usage: `bash scripts/check-ui-actions.sh [source-dir]`

## Stop Conditions
- `.narukana/specs/ui.md` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- Script returns no output — check that ui.md contains action references (`\`...\``)
- False negatives on complex grep patterns — action names may use whitespace or special chars in grep
