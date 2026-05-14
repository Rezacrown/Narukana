#!/bin/bash
cat > .narukana/specs/ui.md << 'EOF'
# UI Spec

## Description
<describe the UI>

## Pages

### Page: Home
- Route: /
- Layout: DefaultLayout
- Display: <description of visual content>
- Data: <data entities>
- Components: <list>
- Actions: <list>

## States
- loading
- empty
- error
- success

<!-- narukana-ui-actions -->
- action: <name> (Page: <page>)
<!-- /narukana-ui-actions -->

<!-- narukana-ui-data -->
- entity: <name>: <fields>
<!-- /narukana-ui-data -->

## User Flow
1) User opens app → lands on Home
EOF
echo "ui.md template created"
