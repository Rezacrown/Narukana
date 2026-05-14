---
name: narukana-context-create
description: Creates or regenerates the `context.md` file in the `.narukana/context/` directory with project overview, tech stack, architecture, and development setup sections. Triggered on requests to create project context, set up project overview, fill in tech stack details, or document architecture. Not triggered for editing individual sections of an existing context file outside the creation flow.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `--regenerate`: Overwrite the existing `context.md` file

## Procedure
1. Pre-check: if `.narukana/context/context.md` exists and `--regenerate` was NOT passed, STOP and inform the user.
2. Read `references/context-template.md` for the required format and sections.
3. Using the Write tool, create `.narukana/context/context.md` with all required sections filled in from user-provided information.
4. Verify the file contains all required sections: `# Project Overview`, `## Tech Stack`, `## Architecture`, `## Development Setup`.

## Verification
- `.narukana/context/context.md` exists
- File contains `# Project Overview` heading
- File contains `## Tech Stack` heading
- File contains `## Architecture` heading
- File contains `## Development Setup` heading

## References
- `references/context-template.md` — Template for the context.md file with required section headers

## Scripts
- `scripts/generate-context.sh` — Creates a minimal context.md with a project description placeholder. Usage: `bash scripts/generate-context.sh "Project description"`.

## Stop Conditions
- `context.md` already exists and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- Required sections are missing from the created file — verify the template was read correctly
