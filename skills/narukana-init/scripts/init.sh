#!/bin/bash
# init.sh — create .narukana/ workspace structure
NARUKANA_DIR="${1:-.narukana}"
mkdir -p "$NARUKANA_DIR/context" "$NARUKANA_DIR/specs"

# Create narukana.json with default config
cat > "$NARUKANA_DIR/narukana.json" << 'EOF'
{
  "schemaVersion": 1,
  "projectName": "",
  "paths": {
    "uiRoot": "",
    "contractRoot": ""
  }
}
EOF

echo "Narukana workspace structure created at $NARUKANA_DIR"
