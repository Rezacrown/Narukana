#!/bin/bash
STATE=".narukana/task-state.txt"
PLAN=".narukana/plan.md"
echo "=== Task Status ==="
if [ -f "$STATE" ]; then
  while IFS='|' read -r tid status ts evidence; do
    echo "$tid: $status ($ts)"
    [ -n "$evidence" ] && echo "  Evidence: $evidence"
  done < "$STATE"
else
  echo "No tasks claimed yet"
fi
echo ""
echo "=== Plan Overview ==="
[ -f "$PLAN" ] && head -20 "$PLAN" || echo "No plan.md found"
