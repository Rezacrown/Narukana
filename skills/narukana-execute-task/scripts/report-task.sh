#!/bin/bash
# report-task.sh — update task status
# Usage: bash scripts/report-task.sh T-001 done "Implementation complete"
TID="${1:-T-001}"
STATUS="${2:-done}"
EVIDENCE="${3:-}"
STATE=".narukana/task-state.txt"
echo "$TID|$STATUS|$(date -Iseconds)|$EVIDENCE" >> "$STATE"
echo "Task $TID marked as $STATUS"
