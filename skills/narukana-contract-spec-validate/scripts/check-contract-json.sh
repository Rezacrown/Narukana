#!/bin/bash
JSON=".narukana/specs/contract.json"
DETAIL=".narukana/specs/contract-detail.md"
[ ! -f "$JSON" ] && echo "ERROR: contract.json not found" && exit 1
[ ! -f "$DETAIL" ] && echo "WARN: contract-detail.md not found"

echo "Checking contract.json structure..."
node -e "
const j = JSON.parse(require('fs').readFileSync('$JSON','utf8'));
if(!j.schemaVersion) console.log('✗ Missing: schemaVersion');
if(!j.name) console.log('✗ Missing: name');
if(!j.domain) console.log('✗ Missing: domain (should be \"contract\" or \"backend\")');
if(!j.operations) console.log('✗ Missing: operations object');
else if(typeof j.operations !== 'object' || Array.isArray(j.operations)) console.log('✗ operations must be an object, not array');
else {
  const count = Object.keys(j.operations).length;
  if(count === 0) console.log('⚠ No operations defined');
  else {
    console.log('✓ Found ' + count + ' operations');
    Object.entries(j.operations).forEach(([k,v]) => {
      if(!v.type) console.log('✗ Operation \"' + k + '\": missing type');
      if(!v.transport) console.log('✗ Operation \"' + k + '\": missing transport');
      if(v.transport === 'http') {
        if(!v.method) console.log('✗ Operation \"' + k + '\": missing method (GET/POST/PUT/DELETE)');
        if(!v.endpoint) console.log('✗ Operation \"' + k + '\": missing endpoint');
      }
      if(v.transport === 'contract') {
        if(!v.target) console.log('✗ Operation \"' + k + '\": missing target contract');
        if(!v.function) console.log('✗ Operation \"' + k + '\": missing function name');
      }
    });
  }
}
" 2>/dev/null || echo "WARN: Invalid JSON or node not available"
