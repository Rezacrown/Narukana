#!/bin/bash
# check-consistency.sh — verify workspace integrity and cross-reference specs
ERRORS=0
WARNS=0

echo "=== File Presence Check ==="
for f in ".narukana/context/context.md" ".narukana/specs/ui.md" ".narukana/specs/contract.json" ".narukana/specs/contract-detail.md" ".narukana/specs/integration.md"; do
  if [ -f "$f" ]; then echo "✓ $f"; else echo "✗ $f"; ERRORS=$((ERRORS+1)); fi
done
[ -f ".narukana/plan.md" ] && echo "✓ .narukana/plan.md" || echo "⚠ .narukana/plan.md (optional until plan-create)"
[ -f ".narukana/tasks.json" ] && echo "✓ .narukana/tasks.json" || echo "⚠ .narukana/tasks.json (optional until plan-create)"

echo ""
echo "=== UI Spec Structure ==="
UI=".narukana/specs/ui.md"
if [ -f "$UI" ]; then
  grep -q "^# UI Spec" "$UI" && echo "✓ # UI Spec heading" || { echo "✗ Missing # UI Spec heading"; ERRORS=$((ERRORS+1)); }
  grep -q "^## Pages" "$UI" && echo "✓ ## Pages section" || { echo "✗ Missing ## Pages section"; ERRORS=$((ERRORS+1)); }
  grep -q "narukana-ui-actions" "$UI" && echo "✓ <!-- narukana-ui-actions -->" || { echo "✗ Missing narukana-ui-actions anchor"; ERRORS=$((ERRORS+1)); }
  grep -q "narukana-ui-data" "$UI" && echo "✓ <!-- narukana-ui-data -->" || { echo "✗ Missing narukana-ui-data anchor"; ERRORS=$((ERRORS+1)); }
else
  echo "⚠ Skipped (file missing)"
fi

echo ""
echo "=== Contract Spec Structure ==="
JSON=".narukana/specs/contract.json"
if [ -f "$JSON" ]; then
  if command -v node &> /dev/null; then
    node -e "
    try {
      const j = JSON.parse(require('fs').readFileSync('$JSON','utf8'));
      let e=0,w=0;
      if(!j.schemaVersion) { console.log('✗ Missing schemaVersion'); e++; }
      if(!j.name) { console.log('✗ Missing name'); e++; }
      if(!j.operations || typeof j.operations !== 'object' || Array.isArray(j.operations)) {
        console.log('✗ operations must be an object'); e++;
      } else {
        const oc = Object.keys(j.operations).length;
        if(oc===0) console.log('⚠ No operations defined');
        else console.log('✓ ' + oc + ' operations defined');
      }
      if(e>0) process.exit(1);
      if(w>0) process.exit(2);
    } catch(e) { console.log('✗ Invalid JSON: ' + e.message); process.exit(1); }
    "
    case $? in
      1) ERRORS=$((ERRORS+1)) ;;
      2) WARNS=$((WARNS+1)) ;;
    esac
  else
    echo "⚠ node not available — basic check only"
    grep -q '"schemaVersion"' "$JSON" && echo "✓ schemaVersion found" || { echo "✗ Missing schemaVersion"; ERRORS=$((ERRORS+1)); }
    grep -q '"name"' "$JSON" && echo "✓ name found" || { echo "✗ Missing name"; ERRORS=$((ERRORS+1)); }
  fi
else
  echo "⚠ Skipped (file missing)"
fi

echo ""
echo "=== Integration Spec Structure ==="
INT=".narukana/specs/integration.md"
if [ -f "$INT" ]; then
  for section in "Runtime Flow" "UI Actions" "Mappings" "Contract Operations" "Error Handling" "Observability"; do
    grep -q "^## $section" "$INT" && echo "✓ $section" || { echo "✗ Missing: $section"; ERRORS=$((ERRORS+1)); }
  done
else
  echo "⚠ Skipped (file missing)"
fi

echo ""
echo "=== Cross-Reference Check ==="
if [ -f "$UI" ] && [ -f "$JSON" ] && [ -f "$INT" ]; then
  echo "ℹ Manual review recommended:"
  echo "  - UI actions in integration.md should exist in ui.md"
  echo "  - Contract ops in integration.md should exist in contract.json"
else
  echo "⚠ Skipped (one or more spec files missing)"
fi

echo ""
echo "=== Results ==="
echo "Errors: $ERRORS | Warnings: $WARNS"
[ "$ERRORS" -gt 0 ] && echo "❌ Issues found — review before proceeding" || echo "✅ All checks passed"
