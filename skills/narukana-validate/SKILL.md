---
name: narukana-validate
description: Validate all spec files and cross-reference consistency in one command. Runs ui-spec-validate, contract-spec-validate, integration-spec-validate, and sync sequentially.
  Do not use for editing specs or running tasks.
---

# Narukana Validate

## Detail
Runs all spec validators and the sync cross-reference check in sequence, compiling results into a single report. Saves time compared to running each validator individually.

**Use when:**
- Before generating a plan to ensure all specs are valid
- After editing multiple spec files
- Debugging cross-spec inconsistencies

**Do NOT use for:**
- Editing or creating spec files
- Running task execution

## HARD RULES
- This skill is read-only. Do NOT modify any files.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- (free text, optional): specific areas to focus validation on

## Procedure

**Step 1: Validate UI Spec Structure**
1. Read `skills/narukana-ui-spec-validate/SKILL.md` for the validation steps
2. Apply those checks to `.narukana/specs/ui.md`
3. Record results

**Step 2: Validate Contract Spec Structure**
1. Read `skills/narukana-contract-spec-validate/SKILL.md` for the validation steps
2. Apply those checks to `.narukana/specs/contract.json` and `.narukana/specs/contract-detail.md`
3. Record results

**Step 3: Validate Integration Spec Structure**
1. Read `skills/narukana-integration-spec-validate/SKILL.md` for the validation steps
2. Apply those checks to `.narukana/specs/integration.md`
3. Record results

**Step 4: Cross-Reference Check**
1. Read `skills/narukana-sync/SKILL.md` for the cross-reference procedure
2. Apply those checks across all specs
3. Record results

**Step 5: Report**
1. Compile all results:
   - UI Spec: ✅ / ❌
   - Contract Spec: ✅ / ❌
   - Integration Spec: ✅ / ❌
   - Cross-Reference: ✅ / ❌
2. If all passed: "All validations passed. Ready for plan generation."
3. If any failed: "Issues found in: <list>. Fix them before running plan-create."

## Stop Conditions
- None — always runs all validators and reports

## Failure Modes
- Spec files missing: "Run spec-create skills first"
- All validators passed but sync found issues: Report them specifically
