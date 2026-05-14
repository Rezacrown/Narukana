---
name: narukana-context-create
description: Creates or regenerates the `context.md` file in the `.narukana/context/` directory with project overview, tech stack, architecture, and development setup sections. Triggered on requests to create project context, set up project overview, fill in tech stack details, or document architecture. Not triggered for editing individual sections of an existing context file outside the creation flow.
---

# Narukana Context Create

## Detail
Creates or regenerates the project context document (`.narukana/context/context.md`) which defines goals, constraints, assumptions, and risks.

**Use when:**
- Defining the initial project context
- Updating project context after requirements change

**Do NOT use for:**
- Creating UI or contract specs (use the respective spec-create skills)
- Running tasks from the plan

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--regenerate`: Overwrite the existing `context.md` file
- (free text, optional): additional instructions or context for this task

## Procedure
1. Pre-check: if `.narukana/context/context.md` exists and `--regenerate` was NOT passed, STOP and inform the user.
- If the user provided additional instructions, incorporate them into your work.
2. Read `references/context-template.md` for the required format and sections.
3. Using the Write tool, create `.narukana/context/context.md` with all required sections filled in from user-provided information.
4. **Check Optional Context Files**
   1. Check if `.narukana/context/techstack.md` exists. If yes, read it for tech stack context.
   2. Check if `.narukana/context/architecture.md` exists. If yes, read it for architecture context.
   3. Check if `.narukana/context/project.md` exists. If yes, read it for project conventions.
   4. Mention any optional files found to the user: "Found additional context files: <list>"
5. Verify the file contains all required sections: `# Project Overview`, `## Tech Stack`, `## Architecture`, `## Development Setup`.

## Verification
- `.narukana/context/context.md` exists
- File contains `# Project Overview` heading
- File contains `## Tech Stack` heading
- File contains `## Architecture` heading
- File contains `## Development Setup` heading

## References
- `references/context-template.md` — template for context.md
- `references/context-example.md` — real-world example (voting dApp)

## Scripts
- `scripts/generate-context.sh` — Creates a minimal context.md with a project description placeholder. Usage: `bash scripts/generate-context.sh "Project description"`.

## Stop Conditions
- `context.md` already exists and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- Required sections are missing from the created file — verify the template was read correctly
