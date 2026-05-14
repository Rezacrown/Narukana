---
name: narukana-integration-spec-create
description: Creates or regenerates the `integration.md` specification file in `.narukana/specs/` with runtime flow, UI actions, mappings, contract operations, error handling, and observability sections. Triggered on requests to document integration between UI and contracts, specify runtime flow, define cross-layer error handling, or create integration specifications. Not triggered for editing existing integration specs or modifying individual mappings.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `--regenerate`: Overwrite the existing `integration.md` file

## Procedure
1. Pre-check: if `.narukana/specs/integration.md` exists and `--regenerate` was NOT passed, STOP and inform the user.
2. Read `references/integration-spec-template.md` for the required format and sections.
3. Using the Write tool, create `.narukana/specs/integration.md` with all required sections filled in from user-provided information.
4. Verify the file contains all required sections: `# Integration Spec`, `## Runtime Flow`, `## UI Actions`, `## Mappings`, `## Contract Operations`, `## Error Handling`, `## Observability`.

## Verification
- `.narukana/specs/integration.md` exists
- File contains `# Integration Spec` heading
- File contains `## Runtime Flow` heading
- File contains `## UI Actions` heading
- File contains `## Mappings` heading
- File contains `## Contract Operations` heading
- File contains `## Error Handling` heading
- File contains `## Observability` heading

## References
- `references/integration-spec-template.md` — Template for the integration specification with runtime flow, UI actions, mappings, contract operations, error handling, and observability sections

## Scripts
- `scripts/generate-integration.sh` — Creates a minimal integration.md template with placeholder sections. Usage: `bash scripts/generate-integration.sh`.

## Stop Conditions
- `integration.md` already exists and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- Required sections are missing from the created file — verify the template was followed correctly
