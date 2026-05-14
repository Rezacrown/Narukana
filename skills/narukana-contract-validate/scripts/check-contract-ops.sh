#!/bin/bash
SPEC=".narukana/specs/contract.json"
SOURCE_DIR="${1:-contracts}"
[ ! -f "$SPEC" ] && echo "ERROR: contract.json not found" && exit 1

echo "Checking contract operations in $SOURCE_DIR..."
# extract operation names from JSON
grep -oP '"name"\s*:\s*"\K[^"]+' "$SPEC" | while read -r op; do
  count=$(grep -rl "$op" "$SOURCE_DIR" --include="*.sol" --include="*.ts" --include="*.rs" --include="*.cairo" --include="*.vy" 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "⚠ MISSING: '$op' not found in source"
  else
    echo "✓ FOUND: '$op' in $count file(s)"
  fi
done
