---
name: narukana-ui-spec-create
description: Creates or regenerates the `ui.md` specification file in `.narukana/specs/` with screens, actions, and data flow sections. Triggered on requests to document UI screens, specify UI actions and their triggers, define UI data flow, or create a UI specification. Not triggered for editing existing UI specs or modifying individual screen definitions.
---

# Narukana UI Spec Create

## Detail
Creates or regenerates the UI specification (`.narukana/specs/ui.md`) which defines screens, components, user actions, and data entities.

**Use when:**
- Defining the UI layer of your application
- Updating UI actions or data flow

**Do NOT use for:**
- Defining contract or backend operations
- Creating integration mappings

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--regenerate`: Overwrite the existing `ui.md` file
- (free text, optional): additional instructions or context for this task

## Procedure
1. Pre-check: if `.narukana/specs/ui.md` exists and `--regenerate` was NOT passed, STOP and inform the user.
- If the user provided additional instructions, incorporate them into your work.
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
- `references/ui-spec-template.md` — template for ui.md
- `references/ui-spec-example.md` — real-world example (voting dApp dashboard)

## Scripts
- `scripts/generate-ui.sh` — Creates a minimal ui.md template with placeholder sections. Usage: `bash scripts/generate-ui.sh`.

## Stop Conditions
- `ui.md` already exists and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- Anchor comments are missing from the created file — verify the template was followed correctly
