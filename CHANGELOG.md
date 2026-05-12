# Changelog

## Unreleased

### Added
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
