#!/bin/bash
# check-ui-actions.sh — grep UI actions from spec, scan source code
SPEC=".narukana/specs/ui.md"
SOURCE_DIR="${1:-src}"
[ ! -f "$SPEC" ] && echo "ERROR: ui.md not found" && exit 1

# Extract action names from the Actions table
echo "Checking UI actions in $SOURCE_DIR..."
grep -oP '`[^`]+`' "$SPEC" | while read -r action; do
  clean="${action//\`/}"
  count=$(grep -rl "$clean" "$SOURCE_DIR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "⚠ MISSING: '$clean' not found in source"
  else
    echo "✓ FOUND: '$clean' in $count file(s)"
  fi
done
