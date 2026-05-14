# Narukana — Final Gap Closure Plan

> Covers: domain removal, ws transport, node fallback, stale handling,
> validate meta-command, idea→context auto, cleanup.

---

## 1) Contract Spec — Hapus `domain`, Tambah `ws` Transport

### 1.1 contract-spec-template.json

```json
{
  "schemaVersion": 1,
  "name": "",
  "operations": {
    "operationName": {
      "type": "query | mutation | event | job",
      "transport": "http | contract | ws",
      "method": "GET | POST | PUT | DELETE | SUBSCRIBE",
      "endpoint": "/api/...",
      "target": "",
      "function": "",
      "event": ""
    }
  }
}
```

- `domain` field removed entirely
- `ws` added to transport options
- Field matrix per transport:
  - http: method (required) + endpoint (required)
  - contract: target (required) + function (required)
  - ws: endpoint (required) + event (optional)

### 1.2 contract-example.json — hapus domain

Remove `"domain": "contract"` from the smart contract example.

### 1.3 contract-example-backend.json — hapus domain

Remove `"domain": "backend"` from the REST API example.

### 1.4 contract-detail-example-backend.md — check consistency

Ensure detail example doesn't reference domain.

---

## 2) Validation Rules Update (6 files)

Each `validation-rules.md` gets updated:

```
## Contract Spec Validation
- Must be valid JSON
- Must have `schemaVersion`, `name` fields
- Each operation must have: `type`, `transport`
- If transport is "http": must have `method`, `endpoint`
- If transport is "contract": must have `target`, `function`
- If transport is "ws": must have `endpoint`; `event` is optional
- Missing `input`/`output` is a warning
```

Files:
- narukana-ui-validate/references/validation-rules.md
- narukana-contract-validate/references/validation-rules.md
- narukana-integration-validate/references/validation-rules.md
- narukana-ui-spec-validate/references/validation-rules.md
- narukana-contract-spec-validate/references/validation-rules.md
- narukana-integration-spec-validate/references/validation-rules.md

---

## 3) check-contract-json.sh — Domain hapus + ws + node fallback

Full rewrite:
- Remove domain check
- Add ws transport validation
- Add node fallback: if `node -e` not available, use grep-based basic check

Fallback logic:
```
1. Check if `node --version` succeeds
2. If YES: use node -e for full JSON validation
3. If NO: basic grep check:
   - grep "schemaVersion"
   - grep "name"  
   - grep "operations"
   - For each operation found, grep for "transport", check fields with basic pattern matching
4. Report: "⚠ node not available — basic validation only"
```

---

## 4) Sync SKILL.md Step 3 — Hapus domain check

Remove the line:
```
3. Verify `schemaVersion`, `name`, `domain` fields exist
```

Replace with:
```
3. Verify `schemaVersion`, `name` fields exist
```

---

## 5) check-consistency.sh — Node fallback

Same pattern as check-contract-json.sh. The JSON validation section gets wrapped with node availability check + fallback.

---

## 6) next-task.sh — Node fallback

Full rewrite with fallback:
```
1. Check node --version
2. If YES: node -e for JSON parse + claim logic (existing)
3. If NO: use grep + sed to find tasks.json tasks:
   - grep "todo" tasks.json → find all todo tasks
   - grep "claimedBy" → check if task has active claim
   - sed to update status
```

---

## 7) report-task.sh — Node fallback

Same pattern:
```
1. Check node --version
2. If YES: node -e (existing)
3. If NO: sed to replace task state inline
```

---

## 8) task-status.sh — Node fallback

Same pattern:
```
1. Check node --version
2. If YES: node -e (existing)
3. If NO: grep-based task state display
```

---

## 9) Regenerasi Plan → Tasks.json Stale Handling

Update `narukana-plan-create SKILL.md` Procedure, Step 2.5:

```
**Step 2.5: Generate Task Ledger**
...
5. If `.narukana/tasks.json` already exists:
   - Read existing tasks.json
   - Compare planId in tasks.json.meta with new plan hash
   - If DIFFERENT: warn user "Plan was regenerated. Previous tasks.json may have active tasks from old plan."
   - Ask user: "Reset tasks.json for new plan? (y/n) — existing task progress will be lost"
   - If yes: write new tasks.json from scratch
   - If no: keep existing tasks.json (manual reconciliation needed)
```

---

## 10) New /narukana-validate Skill

### command/narukana-validate.md
```
# /narukana-validate

Validate all specs and cross-reference

Follow the `narukana-validate` skill procedure exactly.
```

### skills/narukana-validate/SKILL.md
```
Procedure:
1. Run ui-spec-validate checks (from narukana-ui-spec-validate)
2. Run contract-spec-validate checks (from narukana-contract-spec-validate)
3. Run integration-spec-validate checks (from narukana-integration-spec-validate)
4. Run sync cross-reference (from narukana-sync)
5. Compile results into single report:
   - PASS: all validators passed
   - FAIL: list which validators failed
```

No reference files or scripts needed — agent delegates to existing skills.

---

## 11) idea.md → context.md Auto

Update `narukana-commit-idea SKILL.md` Procedure Step 3:

Replace existing step 3 with:
```
**Step 3: Next Steps**
1. Inform user: "Idea saved to .narukana/context/idea.md"
2. Ask user: "Generate context.md from this idea? (y/n)"
3. If yes:
   a. Read references/context-template.md for format
   b. Read .narukana/context/idea.md for content
   c. Extract Goal from idea.md
   d. Write .narukana/context/context.md with Goal + High-Level Purpose
   e. Inform user: "context.md generated. You can now run spec-create skills."
4. If no: "You can always run /narukana-context-create manually."
```

---

## 12) Hapus Empty Directories

Delete:
- `skills/narukana-plan-create/scripts/`
- `skills/narukana-sync/references/`
- `skills/narukana-sync/scripts/`
- `skills/narukana-spec-from-codebase-create/scripts/`

---

## 13) Hapus package-lock.json

Delete `package-lock.json` from Narukana root.

---

## Execution Plan (Parallel Agents)

| Agent | Task | Files |
|-------|------|-------|
| **A** | contract-spec-template.json + 2 example files (domain removal) + ws transport | 3 files |
| **B** | validation-rules.md (6x) + Sync SKILL.md Step 3 | 7 files |
| **C** | check-contract-json.sh + check-consistency.sh (node fallback) | 2 files |
| **D** | next-task.sh + report-task.sh + task-status.sh (node fallback) | 3 files |
| **E** | New /narukana-validate (skill + command) + commit-idea update (idea→context) | 3 files |
| **F** | plan-create SKILL.md (stale tasks.json handling) | 1 file |
| **G** | Cleanup: delete empty dirs + package-lock.json + README + CHANGELOG | ~5 files |
