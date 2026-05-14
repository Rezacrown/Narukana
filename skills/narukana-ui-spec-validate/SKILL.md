---
name: narukana-ui-spec-validate
description: Validates the structure of the ui.md specification file — checks for required headings, anchor comments, and section presence. Triggered by requests to validate ui.md structure, check ui.md headings, verify spec file integrity, or ensure the UI spec follows the required format. Not triggered for deep-scanning source code for UI action implementations or for validating contract or integration specs.
---

# Narukana UI Spec Validate

## Detail
Validates the structure of `ui.md` — checks required headings, anchor comments (`narukana-ui-actions`, `narukana-ui-data`), and section completeness.

**Use when:**
- After editing `ui.md` to confirm it has correct structure
- Before generating the plan to ensure specs are valid

**Do NOT use for:**
- Deep-scanning implementation evidence (use ui-validate)
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
2. Run `bash scripts/check-ui-structure.sh` to verify ui.md contains all required structural elements.
3. Review the output for any "Missing" lines prefixed with `✗`.
4. Report any missing structural elements to the user and suggest corrections.

## Verification
- Script runs without errors
- All expected headings and anchors are reported as present
- Any `✗` lines are clearly reported as failures

## References
- `references/validation-rules.md` — Validation methodology for spec and deep-scan validation

## Scripts
- `scripts/check-ui-structure.sh` — Verifies ui.md contains `# UI Spec`, `## Screens`, `## Actions`, `<!-- narukana-ui-actions -->`, `<!-- narukana-ui-data -->`. Usage: `bash scripts/check-ui-structure.sh`

## Stop Conditions
- `.narukana/specs/ui.md` does not exist

## Failure Modes
- Spec file missing — ensure workspace is initialized (`narukana-init`)
- False negatives on heading detection — check for whitespace or typos in ui.md headings
- Anchor comment not found — ui.md may need `<!-- narukana-ui-actions -->` and `<!-- narukana-ui-data -->` comments added
