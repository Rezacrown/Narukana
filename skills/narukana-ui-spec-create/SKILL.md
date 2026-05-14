---
name: narukana-ui-spec-create
description: Creates or regenerates the `ui.md` specification file in `.narukana/specs/` with screens, actions, and data flow sections. Triggered on requests to document UI screens, specify UI actions and their triggers, define UI data flow, or create a UI specification. Not triggered for editing existing UI specs or modifying individual screen definitions.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `--regenerate`: Overwrite the existing `ui.md` file

## Procedure
1. Pre-check: if `.narukana/specs/ui.md` exists and `--regenerate` was NOT passed, STOP and inform the user.
2. Read `references/ui-spec-template.md` for the required format and sections.
3. Using the Write tool, create `.narukana/specs/ui.md` with all required sections filled in from user-provided information.
4. Verify the file contains the `# UI Spec` heading and the anchor comments `<!-- narukana-ui-actions -->` and `<!-- narukana-ui-data -->`.

## Verification
- `.narukana/specs/ui.md` exists
- File contains `# UI Spec` heading
- File contains `## Screens` heading
- File contains `## Actions` heading
- File contains `## Data Flow` heading
- File contains `<!-- narukana-ui-actions -->` anchor comment
- File contains `<!-- narukana-ui-data -->` anchor comment

## References
- `references/ui-spec-template.md` — Template for the UI specification with screens, actions table, and data flow sections

## Scripts
- `scripts/generate-ui.sh` — Creates a minimal ui.md template with placeholder sections. Usage: `bash scripts/generate-ui.sh`.

## Stop Conditions
- `ui.md` already exists and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- Anchor comments are missing from the created file — verify the template was followed correctly
