#!/bin/bash
SPEC=".narukana/specs/ui.md"
[ ! -f "$SPEC" ] && echo "ERROR: ui.md not found" && exit 1

echo "Checking ui.md structure..."
grep -q "^# UI Spec" "$SPEC" || echo "✗ Missing: # UI Spec heading"
grep -q "narukana-ui-actions" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-actions --> anchor"
grep -q "narukana-ui-data" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-data --> anchor"
grep -q "^## Screens" "$SPEC" || echo "✗ Missing: ## Screens section"
grep -q "^## Actions" "$SPEC" || echo "✗ Missing: ## Actions section"
echo "Structure check complete"
