---
name: narukana-execute-task
description:
  Execute tasks from the plan by loading context, claiming tasks, implementing, and reporting progress. Use when a plan and tasks.json exist.
  Do not use for generating plans or editing specs.
---

# Narukana Execute Task

## Detail

Handles the full task lifecycle: loads project context from memory, reads the task ledger, claims eligible tasks, implements them, verifies against acceptance criteria, and reports progress. Supports multi-agent parallel execution through shared `tasks.json`.

**Use when:**

- A plan has been generated and tasks are ready
- You need to claim and work on tasks
- Checking task status or reporting progress

**Do NOT use for:**

- Generating the plan (use plan-create)
- Creating or editing specs

## HARD RULES

- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error → STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.
- Use your platform's task tracking tool to track **your own** claimed tasks only. DO NOT import all tasks from `tasks.json` — only tasks where `claimedBy` matches your agent `--name`. Platform tools: OpenCode (`todowrite`), Claude Code / Cursor (`TodoWrite`), Cline (`writeToFileTodo`), and other etc agent harness.

## Inputs

- `--name` (optional): agent identifier for task claiming (default: "agent")
- (free text): instructions for which tasks to work on (e.g. "phase 1-2", "UI tasks only")
- (free text, optional): additional instructions or context for this task

## Procedure

**Step 1: Load Context**

1. Read `.narukana/memory.md` for project context (planId, spec summaries, current phase, task state)

- If the user provided additional instructions, incorporate them into your work.

2. If `memory.md` is missing or its `planId` doesn't match `.narukana/plan.md` → regenerate memory by re-reading plan and specs
3. Read `.narukana/context/context.md` for full context
4. Read relevant spec files as needed (referenced in memory)

**Step 2: Read Task State**

1. Read `.narukana/tasks.json`
2. Parse task definitions and their current states
3. If `tasks.json` is missing → STOP, ask user to run plan-create first

**Step 3: Find & Claim Eligible Task**

1. Filter tasks based on user instructions (phase, domain, etc.)
2. Find a task with `status: "todo"` whose dependencies (if any) are all `"done"`
3. Verify no other agent holds a valid active lease (leaseEndsAt in the future)
4. Update `tasks.json`: set `status: "in_progress"`, `claimedBy: <name>`, `claimedAt: now`, `leaseEndsAt: now+30min`
5. Read the task's definition: acceptance criteria, verification steps, spec references
6. **Update your platform's task tracking tool** (OpenCode: `todowrite`, Claude Code/Cursor: `TodoWrite`, Cline: `writeToFileTodo`, and etc):
   - Create ONE entry for the task you just claimed
   - DO NOT list tasks claimed by other agents
   - Format:
     - Title: `"T-XXX — <task title>"`
     - Status: `in_progress`
     - Detail: `"Phase N — <domain> | Acceptance: <first criterion>"`

**Step 4: Implement**

1. Implement the required code changes based on the task definition
2. Do NOT modify `.narukana/` files (those are managed by other skills)
3. **Update your platform's task tracking tool** (use the tool matching your platform — see Step 3.6) with what you're currently doing:
   - Example: `"Writing registerUser() in contracts/UserManager.cairo"`
   - Example: `"Creating unit tests for edge cases"`
   - Update at meaningful boundaries (start of impl, after key file written, before verification)

**Step 5: Verify**

1. Check implementation against acceptance criteria
2. Run relevant verification checks

**Step 6: Report**

1. Update `tasks.json`: set `status: "done"` or `"failed"`, `evidence: <summary>`
2. If failed: include `fatalReason` describing what went wrong
3. **Update your platform's task tracking tool** (use the tool matching your platform — see Step 3.6):
   - If done → mark as completed
   - If failed → mark as failed, include `fatalReason` in the detail

**Step 7: Continue or Standby**

1. If eligible tasks remain → loop to Step 2
2. If all tasks done → report completion to user and standby for next instruction
3. **If continuing to a new task**:
   - Mark the previous task's entry as completed in your platform's task tracking tool (see Step 3.6 for tool name)
   - Create a new entry for the next claimed task (per Step 3.6)

## Verification

- Task is marked as `in_progress` in tasks.json before implementation
- Implementation matches acceptance criteria
- Task status is updated to `done` or `failed` after completion
- Evidence is provided for completed tasks

## References

- `references/tasks-format.md` — task ledger JSON schema (from plan-create skill)
- `references/loop-rules.md` — loop behavior and lease rules
- `references/domain-guard.md` — domain classification for tasks

## Scripts

- `scripts/next-task.sh` — read tasks.json, find and claim next eligible task
- `scripts/report-task.sh` — update task status in tasks.json
- `scripts/task-status.sh` — display current task state from tasks.json

## Stop Conditions

- No eligible tasks remaining (all done, blocked, or claimed with active lease)
- User sends new instruction or interrupt
- Fatal error during implementation

## Failure Modes

- tasks.json missing: "Run plan-create first to generate tasks"
- memory.md stale: Will be regenerated automatically
- No eligible tasks: "All tasks are completed or blocked"
- Claim conflict: "Task already claimed by another agent"
