#!/bin/bash
# generate minimal contract spec
cat > .narukana/specs/contract.json << 'EOF'
{
  "schemaVersion": "1",
  "name": "ContractName",
  "operations": []
}
EOF
cat > .narukana/specs/contract-detail.md << 'EOF'
# Contract Detail

## Functions
- (to be filled)

## Events
- (to be filled)
EOF
echo "contract.json and contract-detail.md created"
