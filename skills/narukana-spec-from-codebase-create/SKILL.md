---
name: narukana-spec-from-codebase-create
description: Reverse-engineers specification files from an existing codebase by scanning source files and generating spec documents. Triggered on requests to create specs from existing code, reverse-engineer a project, bootstrap documentation from source, or generate spec files from a working codebase. Not triggered for editing manually written specs or regenerating individual spec files.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `--regenerate`: Allow overwriting existing spec files
- (no flag): Preview mode only — shows extracted inventory without writing

## Procedure

### Phase 1 — Preview
1. Read `references/scanner-patterns.md` for supported detection patterns.
2. Glob source files in the project:
   - UI: `**/*.{ts,tsx,js,jsx}` — extract component names, page routes, event handlers, API call patterns
   - Contract: `**/*.{sol,cairo,vy,move,rs}` — extract function signatures, event definitions, state variables
   - Integration: search for contract ABI imports, ethers/web3/ethers6 calls, contract address references
3. Show the extracted inventory preview to the user.

### Phase 2 — Generate
1. Ask the user: "Generate spec files from this scan? (y/n)"
2. If yes: Write all 5 spec files — `context.md`, `ui.md`, `contract.json`, `contract-detail.md`, `integration.md` — under `.narukana/`.
3. If no: STOP without writing any files.
4. Do NOT overwrite existing specs unless `--regenerate` flag was set.

## Verification
- Preview output is shown to the user before generation
- Generated spec files exist under `.narukana/`
- Existing spec files are preserved unless `--regenerate` was used

## References
- `references/scanner-patterns.md` — Pattern definitions for UI, Contract, and Integration code detection

## Scripts
- None. Scanning and generation are handled by the agent directly.

## Stop Conditions
- User declines spec generation (Phase 2)
- No source files found (empty preview)

## Failure Modes
- No source files matched by glob patterns — check project structure and file extensions
- Existing specs would be overwritten without `--regenerate` — inform user and stop
- File write fails — check disk space and permissions
