#!/bin/bash
SPEC=".narukana/specs/integration.md"
[ ! -f "$SPEC" ] && echo "ERROR: integration.md not found" && exit 1

echo "Checking integration.md sections..."
for section in "Runtime Flow" "UI Actions" "Mappings" "Contract Operations" "Error Handling" "Observability"; do
  grep -q "^## $section" "$SPEC" && echo "✓ $section" || echo "✗ Missing: $section"
done
