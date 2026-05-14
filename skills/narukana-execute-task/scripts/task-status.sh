#!/bin/bash
# task-status.sh — display current task state
TASKS_JSON=".narukana/tasks.json"
[ ! -f "$TASKS_JSON" ] && echo "ERROR: tasks.json not found" && exit 1

node -e "
const fs = require('fs');
const tasks = JSON.parse(fs.readFileSync('$TASKS_JSON','utf8'));
console.log('=== Task Status ===');
console.log('Plan ID: ' + (tasks.meta.planId || 'unknown'));
console.log('');
tasks.tasks.forEach(t => {
  const s = t.state;
  console.log(t.definition.id + ': ' + s.status);
  if (s.claimedBy) console.log('  Claimed by: ' + s.claimedBy);
  if (s.evidence) console.log('  Evidence: ' + s.evidence);
  if (s.fatalReason) console.log('  Reason: ' + s.fatalReason);
});
console.log('');
const counts = {};
tasks.tasks.forEach(t => { counts[t.state.status] = (counts[t.state.status]||0) + 1; });
console.log('Summary: ' + JSON.stringify(counts));
"
