#!/bin/bash
SPEC=".narukana/specs/ui.md"
[ ! -f "$SPEC" ] && echo "ERROR: ui.md not found" && exit 1

echo "Checking ui.md structure..."
grep -q "^# UI Spec" "$SPEC" || echo "✗ Missing: # UI Spec heading"
grep -q "^## Pages" "$SPEC" || echo "✗ Missing: ## Pages section"
grep -q "^### Page:" "$SPEC" || echo "✗ Missing: Page entries"
grep -q "narukana-ui-actions" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-actions --> anchor"
grep -q "/narukana-ui-actions" "$SPEC" || echo "✗ Missing: <!-- /narukana-ui-actions --> closing anchor"
grep -q "narukana-ui-data" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-data --> anchor"
grep -q "/narukana-ui-data" "$SPEC" || echo "✗ Missing: <!-- /narukana-ui-data --> closing anchor"
grep -q "^## User Flow" "$SPEC" || echo "✗ Missing: ## User Flow section"

PAGE_COUNT=$(grep -c "^### Page:" "$SPEC")
echo ""
if [ "$PAGE_COUNT" -gt 0 ]; then
  echo "✓ Found $PAGE_COUNT page(s)"
  grep "^### Page:" "$SPEC" | while read -r page; do
    pname=$(echo "$page" | sed 's/.*: //')
    has_display=$(grep -A5 "^### Page: $pname" "$SPEC" | grep -c "Display:")
    [ "$has_display" -eq 0 ] && echo "⚠ Page '$pname' missing Display field"
  done
else
  echo "⚠ No pages defined"
fi
echo "Structure check complete"
