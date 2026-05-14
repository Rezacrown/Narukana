# Loop Rules

## Autonomous loop
1. next — claim next eligible task from tasks.json
2. implement — write the required code
3. verify — check against acceptance criteria
4. report — mark task as done/failed with evidence
5. repeat until stop condition or all tasks done

## Lease rules
- Default lease: 30 minutes
- Before claiming, verify no other agent holds an active lease
- If lease expires, the task becomes eligible for any agent
- Use atomic write pattern: write to `.tasks.json.tmp` then rename to `tasks.json`

## Memory loading (required)
- Always read memory.md BEFORE checking tasks.json
- If memory.md is missing or planId doesn't match, regenerate it
- This ensures fresh agents understand the full project context

## Stop conditions
- No eligible tasks remaining
- User sends new instruction or interrupt
- Fatal error during implementation
- All tasks completed → standby and report to user
