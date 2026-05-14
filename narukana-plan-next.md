# Narukana Plan — v2.0 Skill Refinement

> Full specification of all changes needed post-overhaul.
> Covers: execute-task simplification, tasks.json generation, 2 new skills,
> Detail section on all skills, "ask user" rule, cleanup stale references.

---

## 1) All 17 SKILL.md — Add Detail section + "ask user" rule

Every SKILL.md gets a `## Detail` section between the title and `## HARD RULES`.

Format:
```markdown
# <Title>

## Detail
<2-3 sentence explanation of what this skill does and when to use it>

**Use when:**
- <scenario 1>
- <scenario 2>

**Do NOT use for:**
- <negative scenario 1>
- <negative scenario 2>
```

Also add this rule in the Procedure section (or right after HARD RULES):
```
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.
```

Files affected: 17 SKILL.md files under `skills/*/SKILL.md`

---

## 2) narukana-execute-task — Simplify + memory-first

### SKILL.md changes
- Simplify Inputs to: `--name` (optional) + free text instructions
- Procedure: Load memory.md first → Read tasks.json → Find/Claim → Implement → Verify → Report → Loop/Standby
- Remove max-5-tasks stop condition
- Add Detail section + "ask user" rule

### Scripts changes
- `scripts/next-task.sh` — parse `tasks.json` (JSON), find `todo` tasks, claim with lease
- `scripts/report-task.sh` — atomic write to `tasks.json` (write to .tmp, rename)
- `scripts/task-status.sh` — format `tasks.json` contents for display

### References changes
- `references/loop-rules.md` — update: remove max 5, add memory loading requirement, add lease rules, add atomic write pattern

---

## 3) narukana-plan-create — Generate tasks.json

### SKILL.md changes
- Add Detail section + "ask user" rule
- Add Step 2.5: After generating plan.md, parse tasks from plan.md → write `.narukana/tasks.json`

### New references
- `references/tasks-format.md` — JSON schema for tasks.json:
```json
{
  "schemaVersion": 1,
  "meta": { "planId": "", "generatedAt": "" },
  "tasks": [
    {
      "definition": {
        "id": "T-001", "title": "",
        "dependsOn": [], "specRefs": [],
        "acceptance": [], "verification": [],
        "phase": 1
      },
      "state": {
        "status": "todo",
        "claimedBy": null, "claimedAt": null,
        "leaseEndsAt": null, "completedAt": null,
        "evidence": null, "instruction": null
      }
    }
  ]
}
```

---

## 4) narukana-brainstorm (NEW)

- `skills/narukana-brainstorm/SKILL.md` — free-form brainstorming, optional web research
- `command/narukana-brainstorm.md` — router wrapper

---

## 5) narukana-commit-idea (NEW)

- `skills/narukana-commit-idea/SKILL.md` — auto-extract ideas from conversation, write idea.md
- `skills/narukana-commit-idea/references/idea-template.md` — template from old IDEA_CONTEXT_TEMPLATE
- `command/narukana-commit-idea.md` — router wrapper

---

## 6) canonical-layout.md cleanup

Remove `codebase-inventory.json` entirely (not in concept).
Optional files:
```
## Optional files (created on demand)
- .narukana/tasks.json
- .narukana/context/idea.md
```

---

## Execution order (parallel)

| Agent | Task | Files |
|-------|------|-------|
| A | Add Detail + "ask user" to all 17 SKILL.md | 17 SKILL.md files |
| B | Rewrite execute-task (SKILL.md + 3 scripts + loop-rules.md) | 5 files |
| C | Update plan-create (tasks.json gen + tasks-format.md) + canonical-layout.md | 3 files |
| D | Create 2 new skills (brainstorm, commit-idea) + 2 command wrappers | 5 files |

Total: ~30 files affected, all parallelizable.
