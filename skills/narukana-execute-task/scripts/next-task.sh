#!/bin/bash
# next-task.sh — find and claim next eligible task from tasks.json
# Usage: bash scripts/next-task.sh [--name=agent] [phase-filter]
TASKS_JSON=".narukana/tasks.json"
NAME="${2:-agent}"
PHASE_FILTER="$1"

[ ! -f "$TASKS_JSON" ] && echo "ERROR: tasks.json not found" && exit 1

node -e "
const fs = require('fs');
const tasks = JSON.parse(fs.readFileSync('$TASKS_JSON','utf8'));
const name = '$NAME';
const phaseFilter = '$PHASE_FILTER';
const now = Date.now();

// Find first eligible task
for (const task of tasks.tasks) {
  if (task.state.status !== 'todo') continue;
  if (task.state.leaseEndsAt && task.state.leaseEndsAt > now) continue;
  if (phaseFilter) {
    const phases = phaseFilter.replace(/[^0-9,]/g,'').split(',');
    if (!phases.includes(String(task.definition.phase))) continue;
  }
  // Check dependencies
  const depsMet = (task.definition.dependsOn || []).every(depId => {
    const dep = tasks.tasks.find(t => t.definition.id === depId);
    return dep && dep.state.status === 'done';
  });
  if (!depsMet) continue;

  // Claim this task
  task.state.status = 'in_progress';
  task.state.claimedBy = name;
  task.state.claimedAt = now;
  task.state.leaseEndsAt = now + 30 * 60 * 1000;

  fs.writeFileSync('$TASKS_JSON.tmp', JSON.stringify(tasks, null, 2));
  fs.renameSync('$TASKS_JSON.tmp', '$TASKS_JSON');

  console.log('CLAIMED: ' + task.definition.id + ' - ' + task.definition.title);
  if (task.definition.acceptance && task.definition.acceptance.length) {
    console.log('Acceptance:');
    task.definition.acceptance.forEach(a => console.log('  - ' + a));
  }
  process.exit(0);
}

console.log('No eligible tasks found');
"
