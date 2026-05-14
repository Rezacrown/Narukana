---
name: narukana-integration-spec-validate
description: Validates the structure of the integration.md specification file — checks that all six required sections (Runtime Flow, UI Actions, Mappings, Contract Operations, Error Handling, Observability) are present. Triggered by requests to validate integration.md structure, check integration sections, verify spec file completeness, or ensure the integration spec follows the required format. Not triggered for deep-scanning source code or cross-layer consistency checks, or for validating UI or contract specs.
---

## Detail
Validates the structure of `integration.md` — checks all required sections (Runtime Flow, UI Actions, Mappings, Contract Operations, Error Handling, Observability).

**Use when:**
- After editing `integration.md` to confirm correct structure
- Before generating the plan to ensure specs are valid

**Do NOT use for:**
- Deep-scanning implementation evidence (use integration-validate)
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
2. Run `bash scripts/check-integration-sections.sh` to verify all six required sections exist in integration.md.
3. Review the output for any `✗ Missing` lines.
4. Report any missing sections to the user and suggest adding them.

## Verification
- Script runs without errors
- All six required sections (Runtime Flow, UI Actions, Mappings, Contract Operations, Error Handling, Observability) are reported with `✓`
- Any `✗` lines are clearly reported as failures

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-integration-sections.sh` — Verifies integration.md contains six specific `##` headings. Usage: `bash scripts/check-integration-sections.sh`

## Stop Conditions
- `.narukana/specs/integration.md` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- False negatives on section detection — check for whitespace, punctuation, or casing differences in integration.md headings
- Section reported missing when it exists — verify the heading uses exact `##` level and section name spelling
