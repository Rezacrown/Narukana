# narukana_execute_task

Execute task actions: next, report, status, release, assign
**Parameters:**
- `action`: "next" | "report" | "status" | "release" | "assign" - action to perform
- `name`: string (required for next/report/release/assign) - agent identifier
- `leaseMinutes`: number (default: 120) - lease duration in minutes
- `taskId`: string (required for assign/report/release) - task ID
- `status`: "in_progress" | "done" | "failed" | "blocked" | "skipped" (for report)
- `fatalReason`: string (optional) - reason if task failed fatally
- `evidence`: string (optional) - evidence/completion message
- `instruction`: string (optional) - user note for the agent claiming this task


## Usage

```json
{
  "name": "narukana_execute_task",
  "arguments": {}
}
```
