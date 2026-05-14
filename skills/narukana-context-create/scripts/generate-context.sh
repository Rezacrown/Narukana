#!/bin/bash
# generate-context.sh — creates a high-level context.md
# Usage: bash scripts/generate-context.sh "Project description"
DESC="${1:-Project description}"
cat > .narukana/context/context.md << EOF
# Context

## Goal
$DESC

## High-Level Purpose
<describe the project purpose, target users, and expected outcome>
EOF
echo "context.md created"
