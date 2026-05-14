#!/bin/bash
# report-task.sh — update task status in tasks.json
# Usage: bash scripts/report-task.sh <taskId> <status> [evidence]
TASKS_JSON=".narukana/tasks.json"
TID="${1:-}"
STATUS="${2:-done}"
EVIDENCE="${3:-}"

[ ! -f "$TASKS_JSON" ] && echo "ERROR: tasks.json not found" && exit 1
[ -z "$TID" ] && echo "ERROR: taskId required" && exit 1

if command -v node &> /dev/null; then
  node -e "
  const fs = require('fs');
  const tasks = JSON.parse(fs.readFileSync('$TASKS_JSON','utf8'));
  const task = tasks.tasks.find(t => t.definition.id === '$TID');
  if (!task) { console.log('ERROR: task $TID not found'); process.exit(1); }
  task.state.status = '$STATUS';
  task.state.completedAt = Date.now();
  if ('$EVIDENCE') task.state.evidence = '$EVIDENCE';
  fs.writeFileSync('$TASKS_JSON.tmp', JSON.stringify(tasks, null, 2));
  fs.renameSync('$TASKS_JSON.tmp', '$TASKS_JSON');
  console.log('Task $TID marked as $STATUS');
  "
else
  echo "⚠ node not available — basic reporting only"
  echo "To mark task $TID as $STATUS, manually edit $TASKS_JSON"
fi
