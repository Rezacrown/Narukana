# Autonomous Loop Rules

## Basic flow
1. next — claim next eligible task from the plan
2. implement — write the required code
3. report — mark task as done/failed/blocked
4. repeat until stop condition met

## Stop conditions
- 5 tasks completed in one session
- No eligible tasks remaining
- User interrupts
- Fatal error occurs

## Task states
- todo: not yet claimed
- in_progress: claimed by an agent
- done: completed
- failed: could not be completed
- blocked: waiting on dependency
- skipped: intentionally excluded
