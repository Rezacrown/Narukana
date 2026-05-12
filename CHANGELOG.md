# Changelog

## Unreleased

### Added (Plan 4 — v1.3.0)

- `narukana_plan_create` `instruction` parameter: directive for plan generation (produces `## Directive` section in plan.md)
- Plan v2 format: `## Goal`, `## Scope`, `## Phases` with phase grouping, inter-task `DependsOn` chains, embedded PlanId
- `narukana_execute_task` `assign` action: claim specific task by taskId with auto-continue to dependent tasks
- `narukana_execute_task` `instruction` parameter: task-level user notes stored in `task.state.instruction`
- Context package on `next`/`assign`: returns task definition, memory summary, and relevant spec content to reduce agent round-trips
- Autonomous loop mode in execute_task command wrapper: agent loops claim→work→report without user intervention
- Expanded `contract-detail.md` template: `## Validation Rules`, `## Step-by-Step Logic`, `## Edge Cases`, `## Gas Considerations`
- Shared template module (`src/core/templates.ts`): single source of truth for all spec templates
- Shared parser module (`src/core/markdownParsers.ts`): consolidated `parseUIActions`, `parseContractOperations`, `parseIntegrationMappings`
- Auto-release stale task claims: `leaseEndsAt` is now checked in `findEligibleTasks`, expired claims auto-released to `todo`
- `tasks.json` `meta.previousPlanId`: tracks plan version history when plan is regenerated
- `"skipped"` status in execute_task report action
- `narukana_sync` now reports `tasks.json` presence and planId sync status

### Fixed

- `plan_create` default `regenerate` changed to `false` (consistent with all other create tools)
- `plan_create` now backs up `memory.md` before overwrite (previously only `plan.md` was backed up)
- `plan_create` success message now indicates whether files were new or overwritten with backups
- `init.ts` now uses `SCHEMA_VERSION` import instead of hardcoded `1`
- Removed dead `detectPackageManager` code with `require("fs")` in ES module context
- Contract validator no longer errors on missing `input`/`output` fields (downgraded to warnings)
- README badge version updated to 1.1.0
- Command wrapper docs: execute_task status enum includes `"skipped"`; plan_create docs include `instruction` parameter

### Added (Plan 3 — v1.2.0)
- `narukana_spec_from_codebase_create`: scan existing codebase (FE, backend, smart contract) and auto-generate Narukana-compliant spec files. Supports TS/JS, Python, Go, Rust for backend; Solidity, Cairo, Move, Rust (ink!), Vyper for contracts. Two-phase flow: preview inventory then write specs.

- Add derived `.narukana/memory.md` generation during `narukana_plan_create` with required frontmatter metadata:
  - `schemaVersion`
  - `planId`
  - `generatedAt`
  - source hashes (`contextHash`, `uiSpecHash`, `contractHash`, `integrationHash`, `planHash`)
- Add memory sync checks in `narukana_execute_task` and auto-refresh memory when missing, stale, or invalid.
- Keep `tasks.json` on v1 schema (`meta.planId` + `tasks[].definition/state`) with legacy read compatibility.
- Extend `narukana_sync` to report memory presence and memory/plan sync status while remaining read-only.
- Update README with memory-aware multi-agent workflow guidance and OpenCode global/project-only configuration details.
