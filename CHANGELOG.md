# Changelog

## Unreleased

### Added (v1.8.0) — Final gap closure

- **Domain field removed** from contract spec — transport per-operation (http/contract/ws) is sufficient
- **WebSocket transport** (`ws`) added to contract spec template and validators
- **Node fallback** added to all JSON-dependent scripts: next-task.sh, report-task.sh, task-status.sh, check-contract-json.sh, check-consistency.sh
- **Stale tasks.json detection** — plan-create warns when regenerating plan with existing tasks in progress
- **New /narukana-validate command** — runs all validators sequentially and compiles report
- **idea.md → context.md auto-generation** — commit-idea asks to auto-generate context.md
- **package-lock.json** removed (vestigial from old plugin system)
- **Empty skill directories** removed (plan-create/scripts, sync/references, sync/scripts, spec-from-codebase-create/scripts)
- **Sync SKILL.md** — removed domain field check (field no longer exists)
- **Validation rules** updated for ws transport and removed domain requirements

### Added (v1.7.0) — Spec refinement and workflow clarity

- **Context split**: `context.md` now high-level only (Goal + Purpose). Optional context files: `techstack.md`, `architecture.md`, `project.md`.
- **UI spec restructured**: New `## Pages` section with per-page Route, Layout, Display, Data, Components, Actions fields.
- **Example files** added to spec skills: `context-example.md`, `ui-spec-example.md`, `contract-example.json`, `contract-example-backend.json`, `contract-detail-example.md`, `contract-detail-example-backend.md`, `integration-example.md`.
- **Contract spec examples**: Separate files for smart contract (Voting dApp) and REST API (User API) cases.
- **narukana-sync redesigned**: Full cross-reference check across all specs (file presence, structure, cross-spec consistency).
- **Validate scripts updated**: UI validator checks new Pages format; contract validator checks operations object (not array).
- **Free text input** on all 17 skills — users can pass additional instructions with any command.
- **README workflows**: Clear "New project" and "Existing project" flow paths.
- **All SKILL.md files** updated with `## Detail` sections and "ask user" guardrails.

### Added (v1.6.0) — Skill restructuring and template fixes

- Moved `narukana-skills/` to `skills/` for conventional naming
- Removed `scripts/build-command-wrappers.ts` — no build step needed
- Removed `src/commands/` — `command/` is now the source of truth
- `package.json` stripped of all build scripts and dependencies
- `narukana-init` now generates `.narukana/narukana.json` with workspace config
- Contract spec split: backend (REST API) vs smart contract (blockchain), distinguished by `transport` field
- All reference templates updated to match proven old-narukana formats (context, ui, contract, integration, plan, memory, validation, scanner)
- README command guide now includes a Flags column for each command
- Removed outdated HARD RULES from all 15 SKILL.md files

## Unreleased

### Added (v1.5.0) — Complete skill overhaul

- **Complete removal of OpenCode plugin system**: All TypeScript tool files (`src/tools/`, `src/core/`, `src/index.ts`) removed. No more `@opencode-ai/plugin` dependency. No more `tsconfig.json` or TypeScript compilation.
- **15 self-contained skills** under `Narukana/narukana-skills/`. Each skill has:
  - `SKILL.md` — strict procedure for the agent to follow (pre-check, execute, verify)
  - `references/` — templates, format specs, and examples
  - `scripts/` — optional bash helper scripts for common operations
- **Command wrappers as skill routers**: each `/narukana-*` wrapper loads the corresponding skill. No tool names, no parameters, no JSON.
- **Zero runtime dependencies**: works with any terminal-based AI agent. No plugin registration, no config.json changes, no env vars.
- **Bash helper scripts**: `init.sh`, `generate-*.sh`, `check-*.sh`, `next-task.sh`, `report-task.sh`, `task-status.sh` — 10 helper scripts across the skill pack.
- **Reference templates**: canonical layout, context template, UI spec template, contract spec template, contract detail template, integration spec template, plan format v2, memory format, loop rules, domain guard, scanner patterns, validation rules.
- `package.json` simplified — only `build:command` script remains.
- `scripts/build-command-wrappers.ts` updated to generate English router wrappers.

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
