---
name: narukana-plan-create
description: Generates `plan.md` and `memory.md` from existing spec files. Triggered on requests to create or regenerate the project plan, build a task breakdown from specs, or produce a memory brief for agent sessions. Not triggered for editing an existing plan or manually updating task state.
---

## Detail
Generates the execution plan (`plan.md`) and task ledger (`tasks.json`) from the current spec files (context, UI, contract, integration). Creates the bridge between specification and execution.

**Use when:**
- All spec files are complete and validated
- Ready to move from spec phase to execution phase

**Do NOT use for:**
- Editing individual specs (use spec-create skills)
- Executing tasks from the plan (use execute-task skill)

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--regenerate`: Force regeneration of `plan.md` and `memory.md` even if they already exist
- (free text, optional): additional instructions or context for this task

## Procedure
1. Pre-check: verify all spec files exist — `context.md`, `ui.md`, `contract.json`, `integration.md` under `.narukana/`.
- If the user provided additional instructions, incorporate them into your work.
2. Pre-check: if `.narukana/plan.md` exists and `--regenerate` was NOT passed, STOP and inform the user the plan already exists.
3. Read `references/plan-format-v2.md` for the plan format specification.
4. Read `references/memory-format.md` for the memory brief format specification.
5. Read all spec files (context.md, ui.md, contract.json, contract-detail.md, integration.md) to understand the project.
6. Generate `.narukana/plan.md` with: Directive, Goal, Scope, and Phases (each with tasks using T-XXX identifiers).
7. Generate `.narukana/memory.md` with: planId (SHA256 of plan.md), phase, task list summary, spec hashes, and ISO timestamp.

**Step 2.5: Generate Task Ledger**
1. Read `.narukana/plan.md` and parse all task definitions (T-001, T-002, etc.)
2. Read `references/tasks-format.md` for the JSON schema
3. For each task in plan.md, create a task entry with:
   - id, title, dependsOn, specRefs, acceptance, verification, phase (from plan.md)
   - state: status=todo, all other fields null
4. Write `.narukana/tasks.json` with schemaVersion=1, meta.planId=<hash of plan.md>
5. Verify tasks.json exists and is valid JSON

8. Verify both files exist at `.narukana/plan.md` and `.narukana/memory.md`.

## Verification
- `.narukana/plan.md` exists and contains Directive, Goal, Scope, and at least one Phase with tasks
- `.narukana/memory.md` exists and contains planId, phase, generatedAt, and key spec references
- All spec files still exist and are unmodified

## References
- `references/plan-format-v2.md` — Defines the structure of plan.md
- `references/memory-format.md` — Defines the structure of memory.md
- `references/tasks-format.md` — Defines the structure of tasks.json

## Scripts
- None. Plan generation is handled by the agent directly.

## Stop Conditions
- Spec files are missing (pre-check fails)
- `plan.md` already exists and `--regenerate` was not provided

## Failure Modes
- Missing spec files — run `narukana-init` or `narukana-sync` first
- Plan file write fails — check disk space and permissions
- Format deviation — verify output matches reference formats exactly
