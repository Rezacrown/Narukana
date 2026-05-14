#!/bin/bash
UI=".narukana/specs/ui.md"
CONTRACT=".narukana/specs/contract.json"
INTEGRATION=".narukana/specs/integration.md"

[ ! -f "$INTEGRATION" ] && echo "ERROR: integration.md not found" && exit 1

echo "Cross-referencing integration mappings..."
# Extract UI actions from integration
grep -oP '`[^`]+`' "$INTEGRATION" | while read -r ref; do
  clean="${ref//\`/}"
  found_ui=$(grep -c "$clean" "$UI" 2>/dev/null)
  found_contract=$(grep -c "$clean" "$CONTRACT" 2>/dev/null)
  [ "$found_ui" -eq 0 ] && [ "$found_contract" -eq 0 ] && echo "⚠ UNREFERENCED: '$clean' not in ui.md or contract.json"
done
echo "Integration check complete"
