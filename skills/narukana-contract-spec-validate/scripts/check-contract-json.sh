#!/bin/bash
JSON=".narukana/specs/contract.json"
DETAIL=".narukana/specs/contract-detail.md"
[ ! -f "$JSON" ] && echo "ERROR: contract.json not found" && exit 1
[ ! -f "$DETAIL" ] && echo "WARN: contract-detail.md not found"

echo "Checking contract.json structure..."
# basic validation via node (if available) or grep
node -e "
const j = JSON.parse(require('fs').readFileSync('$JSON','utf8'));
if(!j.schemaVersion) console.log('✗ Missing: schemaVersion');
if(!j.name) console.log('✗ Missing: name');
if(!j.operations) console.log('✗ Missing: operations array');
else if(j.operations.length === 0) console.log('⚠ No operations defined');
j.operations.forEach((o,i) => {
  if(!o.name) console.log('✗ Operation ' + i + ': missing name');
  if(!o.type) console.log('⚠ Operation ' + i + ': missing type');
});
" 2>/dev/null || echo "WARN: Skipping deep validation (node not available)"
