---
name: narukana-execute-task
description: Executes plan tasks by claiming, implementing, reporting, or viewing status. Triggered on requests to work on a task from the plan, claim the next eligible task, report task progress, or show task status. Not triggered for creating or modifying the plan itself, or for editing spec files.
---

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.

## Inputs
- `next`: Claim the next eligible task from the plan
- `report <taskId> <status> <evidence>`: Update a task's status
- `status`: Show all task statuses
- (no flag): Autonomous loop — repeat next → implement → report until stop condition

## Procedure
1. Read `references/loop-rules.md` and `references/domain-guard.md`.
2. Determine the action from user input or autonomous loop context.
3. For `next`: run `bash scripts/next-task.sh` to identify task, then implement the required code, then run `bash scripts/report-task.sh <taskId> done "<summary>"`.
4. For `report`: run `bash scripts/report-task.sh <taskId> <status> "<evidence>"`.
5. For `status`: run `bash scripts/task-status.sh`.
6. For autonomous loop: repeat steps 2-5 until a stop condition is met.

## Verification
- Task state file `.narukana/task-state.txt` reflects current task statuses
- Implemented code compiles/passes relevant checks
- Scripts execute without errors

## References
- `references/loop-rules.md` — Autonomous loop flow and stop conditions
- `references/domain-guard.md` — Domain ordering rules (Contract → Integration → UI)

## Scripts
- `scripts/next-task.sh` — Claims the next eligible task from plan.md. Usage: `bash scripts/next-task.sh`
- `scripts/report-task.sh` — Updates task status with evidence. Usage: `bash scripts/report-task.sh <taskId> <status> "<evidence>"`
- `scripts/task-status.sh` — Shows all task statuses and plan overview. Usage: `bash scripts/task-status.sh`

## Stop Conditions
- 5 tasks completed in one session
- No eligible tasks remaining
- User interrupts
- Fatal error occurs

## Failure Modes
- `plan.md` not found — run `narukana-plan-create` first
- Script not executable — run `chmod +x scripts/*.sh`
- Task already claimed — `next-task.sh` will skip it
- Invalid status value — must be one of: todo, in_progress, done, failed, blocked, skipped
