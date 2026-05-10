# narukana_execute_task

Execute task actions: next, report, status, release
**Parameters:**
- `action`: "next" | "report" | "status" | "release" - action to perform
- `name`: string (optional) - name/identifier for the agent claiming the task
- `leaseMinutes`: number (default: 120) - lease duration in minutes
- `taskId`: string (required for report/release) - task ID
- `status`: "in_progress" | "done" | "failed" | "blocked" | "skipped" (for report)
- `fatalReason`: string (optional) - reason if task failed fatally
- `evidence`: string (optional) - evidence/completion message


## Usage

```json
{
  "name": "narukana_execute_task",
  "arguments": {}
}
```
