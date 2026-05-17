# Loop Rules

## Autonomous loop

1. next — claim next eligible task from tasks.json
2. implement — write the required code
3. verify — check against acceptance criteria
4. report — mark task as done/failed with evidence
5. update platform todos (per claim/complete cycle)
6. repeat until stop condition or all tasks done

## Lease rules

- Default lease: 30 minutes
- Before claiming, verify no other agent holds an active lease
- If lease expires, the task becomes eligible for any agent
- Use atomic write pattern: write to `.tasks.json.tmp` then rename to `tasks.json`

## Memory loading (required)

- Always read memory.md BEFORE checking tasks.json
- If memory.md is missing or planId doesn't match, regenerate it
- This ensures fresh agents understand the full project context

## Platform todo tracking

Tool mapping: OpenCode (`todowrite`), Claude Code / Cursor (`TodoWrite`), Cline (`writeToFileTodo`), and other etc agent harness (generic task tracking tool).

- After claiming a task → create ONE entry in your platform's todos tool
- During implementation → update the entry's detail with current activity
- After reporting → mark entry as done or failed
- ONLY track tasks you personally claimed (claimedBy matches your --name)
- DO NOT import every task from tasks.json into your todos

## Sub-agent coordination

When `--subagent` is used:

- **Pre-claim**: Main agent claims ALL eligible tasks before spawning sub-agents. Prevents race conditions.
- **Full context**: Sub-agent MUST load `.narukana/memory.md` and relevant spec files before implementing — same knowledge depth as a fresh `narukana-execute-task` session.
- **Scoped work**: Sub-agent receives exactly one task definition. It does not read or write `tasks.json` — it reports results back to the main agent.
- **Fallback**: If the platform does not support sub-agent spawning (no Task tool), fall back to normal single-task execution. Do not block.
- **Reporting**: Sub-agent returns: task ID, status (done/failed), evidence summary, fatalReason (if failed). Main agent writes these to `tasks.json`.

## Stop conditions

- No eligible tasks remaining
- User sends new instruction or interrupt
- Fatal error during implementation
- All tasks completed → standby and report to user
- `--parallel`: after one task completes (no auto-loop)
