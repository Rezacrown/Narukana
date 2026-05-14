#!/bin/bash
# next-task.sh — select next eligible task from plan.md
PLAN=".narukana/plan.md"
TASKS=".narukana/tasks.json"
STATE=".narukana/task-state.txt"

if [ -f "$STATE" ]; then
  echo "Current tasks:"
  cat "$STATE"
  echo ""
fi

echo "Reading tasks from plan.md..."
# Parse tasks from plan.md
grep -oP 'T-\d+' "$PLAN" | while read -r tid; do
  if [ ! -f "$STATE" ] || ! grep -q "^$tid|" "$STATE" 2>/dev/null; then
    echo "Next eligible: $tid"
    exit 0
  fi
done
echo "No eligible tasks found"
