---
name: narukana-sync
description: Verifies that all required workspace files exist under `.narukana/`. Triggered on requests to check workspace health, verify file integrity, confirm the project is ready for work, or diagnose missing files. Not triggered for creating or repairing missing files — only reports their status.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- None. Runs the same checks every time.

## Procedure
1. Check each required file exists using `test -f`:
   - `test -f .narukana/context/context.md`
   - `test -f .narukana/specs/ui.md`
   - `test -f .narukana/specs/contract.json`
   - `test -f .narukana/specs/contract-detail.md`
   - `test -f .narukana/specs/integration.md`
   - `test -f .narukana/plan.md`
2. Report results to the user — list which files exist and which are missing.

## Verification
- Output clearly shows each file and its presence (exists/missing)
- Report is delivered to user for action

## References
- None. File paths are hardcoded in the procedure.

## Scripts
- None. File checks are done directly via `test -f`.

## Stop Conditions
- None. Always runs to completion.

## Failure Modes
- `test -f` may fail if the working directory is not the project root — ensure the command runs from the correct directory
- Report may be ignored — the user must act on missing files
