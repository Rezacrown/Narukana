# Tasks Format

tasks.json is the shared communication layer for multi-agent coordination.
All agents read and write to this file to claim tasks, report progress, and
discover available work.

## JSON Schema

```json
{
  "schemaVersion": 1,
  "meta": {
    "planId": "<sha256 hash of plan.md content>",
    "generatedAt": "<ISO timestamp>"
  },
  "tasks": [
    {
      "definition": {
        "id": "T-001",
        "title": "Implement login screen",
        "dependsOn": [],
        "specRefs": ["ui.md"],
        "acceptance": [
          "Component renders correctly",
          "Handles loading, error, and success states"
        ],
        "verification": [
          "Manual test all states",
          "Unit tests pass"
        ],
        "phase": 1
      },
      "state": {
        "status": "todo",
        "claimedBy": null,
        "claimedAt": null,
        "leaseEndsAt": null,
        "completedAt": null,
        "fatalReason": null,
        "evidence": null,
        "instruction": null
      }
    }
  ]
}
```

## Fields

### meta
- `planId`: SHA256 hash of plan.md content. Used to detect staleness.
- `generatedAt`: When this tasks.json was generated.

### definition (immutable — set at creation)
- `id`: Unique task identifier (T-001, T-002, etc.)
- `title`: Human-readable task name
- `dependsOn`: Task IDs that must be completed first
- `specRefs`: Spec files relevant to this task
- `acceptance`: Conditions that must be met to consider the task done
- `verification`: Steps to verify completion
- `phase`: Phase number from plan.md

### state (mutable — updated by agents)
- `status`: todo | in_progress | done | failed | blocked | skipped
- `claimedBy`: Agent identifier who claimed this task
- `claimedAt`: Timestamp when task was claimed
- `leaseEndsAt`: Timestamp when lease expires (default: +30 min)
- `completedAt`: Timestamp when task was completed/failed
- `fatalReason`: Reason if task failed fatally
- `evidence`: Completion evidence / report message
- `instruction`: Optional notes for the claiming agent

## Agent Protocol

1. **Read**: Read the entire tasks.json file
2. **Find**: Look for tasks with status "todo" and valid leases
3. **Claim**: Set status=in_progress, claimedBy=<name>, leaseEndsAt=now+30min
4. **Work**: Implement according to definition
5. **Report**: Set status=done/failed, evidence=<message>
6. **Atomic write**: Write to .tasks.json.tmp → rename to tasks.json
