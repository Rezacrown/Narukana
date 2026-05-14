---
name: narukana-sync
description: Verify workspace integrity by checking file presence and cross-referencing all specs for consistency.
  Use before plan generation or when debugging spec issues.
  Do not use for editing or creating files.
---

# Narukana Sync

## Detail
Checks workspace integrity by verifying file presence and cross-referencing all specs. Detects missing files, structural issues, and cross-spec inconsistencies that could cause problems during plan generation or execution.

**Use when:**
- Before running plan-create to ensure all specs are valid
- Debugging spec-related issues
- Verifying multi-agent workspace integrity

**Do NOT use for:**
- Editing or creating files
- Running task execution

## HARD RULES
- This skill is read-only. Do NOT modify any files.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- (free text, optional): specific areas to focus the check on

## Procedure

**Step 1: File Presence Check**
1. `.narukana/context/context.md` exists
- If the user provided additional instructions, incorporate them into your work.
2. `.narukana/specs/ui.md` exists
3. `.narukana/specs/contract.json` exists
4. `.narukana/specs/contract-detail.md` exists
5. `.narukana/specs/integration.md` exists
6. `.narukana/plan.md` exists
7. `.narukana/tasks.json` exists

**Step 2: UI Spec Structure Check**
1. Read `.narukana/specs/ui.md`
2. Verify `# UI Spec` heading exists
3. Verify `## Pages` section exists with at least one page
4. Verify `<!-- narukana-ui-actions -->` and `<!-- /narukana-ui-actions -->` anchors exist
5. Verify `<!-- narukana-ui-data -->` and `<!-- /narukana-ui-data -->` anchors exist
6. Verify `## User Flow` section exists

**Step 3: Contract Spec Structure Check**
1. Read `.narukana/specs/contract.json`
2. Verify it is valid JSON
3. Verify `schemaVersion`, `name` fields exist
4. Verify `operations` is an object with at least one entry
5. For each operation, verify transport-specific fields exist

**Step 4: Integration Spec Structure Check**
1. Read `.narukana/specs/integration.md`
2. Verify all 6 required sections exist: Runtime Flow, UI Actions, Mappings, Contract Operations, Error Handling, Observability

**Step 5: Cross-Reference Check**
1. Verify UI actions listed in integration.md match those in ui.md
2. Verify contract operations listed in integration.md match those in contract.json
3. If plan.md exists: verify task specRefs reference existing spec files

**Step 6: Report**
1. For each check: ✅ passed / ❌ failed / ⚠ warning
2. For failures: explain the potential impact in plain language
3. Example: "contract.json missing 'domain' field — plan generation may not know whether this is backend or smart contract"

## Verification
- All checks are read-only — no files are modified
- Report is printed to user with clear status indicators

## References
- `references/validation-rules.md` — validation rules for all spec types

## Scripts
- `scripts/check-consistency.sh` — comprehensive workspace check script

## Stop Conditions
- None — always runs all checks and reports

## Failure Modes
- No workspace: ".narukana/ not found. Run narukana-init first."
- All files present but all empty: "Spec files exist but appear empty"
