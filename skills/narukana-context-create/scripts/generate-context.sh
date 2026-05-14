#!/bin/bash
# generate-context.sh — creates a minimal context.md
# Usage: bash scripts/generate-context.sh "Project description"
DESC="${1:-Project description}"
cat > .narukana/context/context.md << 'EOF'
# Project Overview
DESC_PLACEHOLDER

## Tech Stack
- Frontend:
- Backend:
- Contract:

## Architecture
<to be filled>
EOF
sed -i "s/DESC_PLACEHOLDER/$DESC/" .narukana/context/context.md
echo "context.md created"
