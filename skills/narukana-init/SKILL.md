---
name: narukana-init
description: Initializes the `.narukana/` workspace directory structure and creates all required specification files. Triggered on requests to start a new Narukana project, set up the Narukana workspace, initialize the project structure, or bootstrap specs. Not triggered for modifying existing spec files or regenerating individual files outside the workspace init flow.
---

# Narukana Init

## Detail
Creates the `.narukana/` workspace directory structure with default config and template files. Sets up the foundation for all other Narukana skills.

**Use when:**
- Starting a new project that needs a Narukana workspace
- Resetting an existing workspace (with `--regenerate`)

**Do NOT use for:**
- Editing specs or context (use spec-create skills)
- Running tasks (use execute-task skill)

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--regenerate`: Force regeneration of the workspace structure even if `.narukana/` already exists
- (free text, optional): additional instructions or context for this task

## Procedure
1. Pre-check: if `.narukana/` exists and `--regenerate` was NOT passed, STOP and inform the user the workspace already exists.
- If the user provided additional instructions, incorporate them into your work.
2. Run `bash scripts/init.sh` to create the directory structure.
3. Read `references/canonical-layout.md` for the expected file listing.
4. Using the Write tool, create each file listed in canonical-layout.md using the corresponding reference templates as a guide.
5. Verify every file listed in canonical-layout.md exists under `.narukana/`.

## Verification
- `.narukana/` directory exists
- `.narukana/context/` subdirectory exists
- `.narukana/specs/` subdirectory exists
- `.narukana/context/context.md` exists
- `.narukana/specs/ui.md` exists
- `.narukana/specs/contract.json` exists
- `.narukana/specs/contract-detail.md` exists
- `.narukana/specs/integration.md` exists
- `.narukana/templates/` does NOT exist
- `.narukana/cache/` does NOT exist
- `.narukana/logs/` does NOT exist

## References
- `references/canonical-layout.md` — Defines the required and forbidden files in the `.narukana/` workspace

## Scripts
- `scripts/init.sh` — Creates the `.narukana/context/` and `.narukana/specs/` directories. Usage: `bash scripts/init.sh [path]` where path defaults to `.narukana`.

## Stop Conditions
- `.narukana/` already exists and `--regenerate` was not provided

## Failure Modes
- Directory creation fails due to permissions — check write access to the project root
- Script not found — ensure working directory is the project root
- File write fails — check disk space and permissions
