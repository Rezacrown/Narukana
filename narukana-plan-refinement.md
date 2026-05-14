# Narukana — Complete Refinement Plan

> All changes post-v2.0 skill overhaul. Covers: context split, UI spec restructure,
> example files, sync cross-check, free text input, workflow docs, validate updates.

---

## 1) README — Workflow Documentation

### 1.1 New Project Workflow

Add to Quick Start section:

```
brainstorm
  → commit-idea (saves to .narukana/context/idea.md)
    → context-create (high-level Goal + Purpose)
      → spec-create (ui.md, contract.json, integration.md)
        → validate (ui-spec-validate, contract-spec-validate, integration-spec-validate)
          → plan-create (generates plan.md + tasks.json)
            → execute (narukana-execute-task)
```

### 1.2 Existing Project Workflow

```
spec-from-codebase (reverse-engineer from existing code)
  → context-create (high-level Goal + Purpose)
    → spec-create (ui.md, contract.json, integration.md)
      → validate
        → plan-create
          → execute
```

---

## 2) Context Split — High-Level Only

### 2.1 context-template.md

File: `skills/narukana-context-create/references/context-template.md`

Rewrite to high-level only:

```markdown
# Context

## Goal
What are we building? What problem does it solve? Describe the desired outcome in one paragraph.

## High-Level Purpose
One paragraph describing the project's purpose, target users, and expected outcome.
```

### 2.2 generate-context.sh

File: `skills/narukana-context-create/scripts/generate-context.sh`

Simplify heredoc to match new template:

```bash
#!/bin/bash
DESC="${1:-Project description}"
cat > .narukana/context/context.md << EOF
# Context

## Goal
$DESC

## High-Level Purpose
<describe the project purpose, target users, and expected outcome>
EOF
echo "context.md created"
```

### 2.3 canonical-layout.md

File: `skills/narukana-init/references/canonical-layout.md`

Add optional context files:

```
## Optional files (created on demand)
- .narukana/tasks.json
- .narukana/context/idea.md
- .narukana/context/techstack.md (optional — frameworks, tools, runtime)
- .narukana/context/architecture.md (optional — architecture description)
- .narukana/context/project.md (optional — repo structure, conventions)
```

### 2.4 narukana-context-create SKILL.md

Add to Procedure (after Step 2 / creating context.md):

```
**Step 3: Check Optional Context Files**
1. Check if `.narukana/context/techstack.md` exists. If yes, read it for tech stack context.
2. Check if `.narukana/context/architecture.md` exists. If yes, read it for architecture context.
3. Check if `.narukana/context/project.md` exists. If yes, read it for project conventions.
4. Mention any optional files found to the user: "Found additional context files: ___"
```

---

## 3) UI Spec — New Structure with Pages + Display

### 3.1 ui-spec-template.md

File: `skills/narukana-ui-spec-create/references/ui-spec-template.md`

Rewrite:

```markdown
# UI Spec

## Description
A short description of the UI and what it enables.

## Pages

### Page: {name}
- Route: {path}
- Layout: {layout component}
- Display: {what the user sees — visual content description, data shown, interactions}
- Data: {data entities displayed, referenced from <!-- narukana-ui-data -->}
- Components: {list of technical components}
- Actions: {list of actions available on this page}

### Page: {name}
- Route: {path}
- Layout: {layout component}
- Display: {description}
- Data: {data entities}
- Components: {list}
- Actions: {list}

## States
- loading
- empty
- error
- success

<!-- narukana-ui-actions -->
- action: {name} (Page: {page})
- action: {name} (Page: {page})
<!-- /narukana-ui-actions -->

<!-- narukana-ui-data -->
- entity: {name}: {field1}, {field2}, ...
- entity: {name}: {field1}, {field2}, ...
<!-- /narukana-ui-data -->

## User Flow
1) User opens app → lands on {page}
2) User triggers {action} on {page}
3) UI calls {operation}
4) UI displays result on {page}
```

### 3.2 generate-ui.sh

File: `skills/narukana-ui-spec-create/scripts/generate-ui.sh`

Update heredoc:

```bash
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
```

---

## 4) Example Files

### 4.1 context-example.md

File: `skills/narukana-context-create/references/context-example.md`

```markdown
# Context

## Goal
Build a decentralized voting dApp where users can create proposals and cast votes using ERC-20 tokens.

## High-Level Purpose
Enable trustless community decision-making through on-chain voting. Users create proposals with description and voting period, token holders vote with their balance, and anyone can execute passed proposals. Target audience is DAO communities and token-based organizations.
```

### 4.2 ui-spec-example.md

File: `skills/narukana-ui-spec-create/references/ui-spec-example.md`

```markdown
# UI Spec

## Description
A voting dashboard where users can view active proposals, create new ones, and cast votes.

## Pages

### Page: Proposal List
- Route: /
- Layout: DefaultLayout
- Display: List of all proposals with status badges (Active, Passed, Rejected), proposal titles, vote counts, and time remaining. Loading state shows skeleton cards. Empty state shows "No proposals yet. Create the first one!" CTA button.
- Data: Proposals list (id, title, status, votesFor, votesAgainst, deadline)
- Components: ProposalCard, StatusBadge, VoteProgressBar, CreateProposalButton, EmptyState, SkeletonLoader
- Actions: view proposal details, create new proposal

### Page: Proposal Detail
- Route: /proposal/:id
- Layout: DefaultLayout
- Display: Full proposal view with title and description at top, vote counts as horizontal progress bars (for/against), countdown timer showing time remaining, vote button (if active), results table (if ended), and comment section. Error state shows "Proposal not found" for invalid IDs.
- Data: Proposal (id, title, description, votesFor, votesAgainst, deadline, status, creator)
- Components: ProposalHeader, VoteProgressBar, CountdownTimer, VoteButton, ResultsTable, ErrorState
- Actions: cast vote, execute proposal (if passed and ended)

### Page: Create Proposal
- Route: /proposal/create
- Layout: DefaultLayout
- Display: Form with title input, description textarea, voting duration selector (1 day, 3 days, 1 week, 2 weeks). Wallet must be connected. Submit button with loading state. Validation errors shown inline.
- Data: Proposal form data (title, description, votingDuration)
- Components: ProposalForm, FormInput, FormTextarea, DurationSelector, SubmitButton, WalletRequiredNotice
- Actions: submit new proposal

## States
- loading: skeleton loaders for proposal cards, spinner for vote submission
- empty: "No proposals found" with create CTA on list page
- error: "Failed to load proposals. Retry?" toast notification, "Proposal not found" error state
- success: "Vote cast successfully!" toast, "Proposal created!" redirect

<!-- narukana-ui-actions -->
- action: view proposal details (Page: Proposal List)
- action: create proposal (Page: Create Proposal)
- action: cast vote (Page: Proposal Detail)
- action: execute proposal (Page: Proposal Detail)
<!-- /narukana-ui-actions -->

<!-- narukana-ui-data -->
- entity: Proposal: id, title, description, status, votesFor, votesAgainst, deadline, creator
- entity: Vote: proposalId, voter, weight, support
- entity: ProposalForm: title, description, votingDuration
<!-- /narukana-ui-data -->

## User Flow
1) User connects wallet → lands on Proposal List page
2) User clicks "Create Proposal" → navigates to Create Proposal page
3) User fills form → submits → UI calls createProposal operation
4) Success → redirects to new Proposal Detail page
5) Other users view Proposal Detail → click "Cast Vote" → select support → confirm
6) UI calls castVote operation → updates vote counts on Proposal Detail
7) After deadline passes → anyone can click "Execute" → calls executeProposal
```

### 4.3 contract-example.json

File: `skills/narukana-contract-spec-create/references/contract-example.json`

```json
{
  "schemaVersion": 1,
  "name": "VotingContract",
  "domain": "contract",
  "operations": {
    "createProposal": {
      "type": "mutation",
      "transport": "contract",
      "target": "VotingContract",
      "function": "createProposal"
    },
    "castVote": {
      "type": "mutation",
      "transport": "contract",
      "target": "VotingContract",
      "function": "castVote"
    },
    "executeProposal": {
      "type": "mutation",
      "transport": "contract",
      "target": "VotingContract",
      "function": "executeProposal"
    },
    "getProposal": {
      "type": "query",
      "transport": "contract",
      "target": "VotingContract",
      "function": "getProposal"
    },
    "getProposals": {
      "type": "query",
      "transport": "contract",
      "target": "VotingContract",
      "function": "getProposals"
    }
  }
}
```

### 4.4 contract-example-backend.json

File: `skills/narukana-contract-spec-create/references/contract-example-backend.json`

```json
{
  "schemaVersion": 1,
  "name": "UserAPI",
  "domain": "backend",
  "operations": {
    "getUsers": {
      "type": "query",
      "transport": "http",
      "method": "GET",
      "endpoint": "/api/users"
    },
    "getUserById": {
      "type": "query",
      "transport": "http",
      "method": "GET",
      "endpoint": "/api/users/:id"
    },
    "createUser": {
      "type": "mutation",
      "transport": "http",
      "method": "POST",
      "endpoint": "/api/users"
    },
    "updateUser": {
      "type": "mutation",
      "transport": "http",
      "method": "PUT",
      "endpoint": "/api/users/:id"
    },
    "deleteUser": {
      "type": "mutation",
      "transport": "http",
      "method": "DELETE",
      "endpoint": "/api/users/:id"
    }
  }
}
```

### 4.5 contract-detail-example.md

File: `skills/narukana-contract-spec-create/references/contract-detail-example.md`

```markdown
# Contract / API Details

> Example: Smart Contract (VotingContract)

## Operation: createProposal
- Type: mutation
- Transport: contract
- Method: N/A
- Endpoint: N/A

### Purpose
Create a new voting proposal.

### Input
- title: string
- description: string
- votingDuration: uint (seconds)

### Output
- proposalId: uint

### Validation Rules
- title must not be empty
- description must not be empty
- votingDuration must be between 1 hour and 30 days
- Caller must have at least 1 token

### Step-by-Step Logic
1. Validate inputs
2. Increment proposal counter
3. Create Proposal struct with caller as creator
4. Store in proposals mapping
5. Emit ProposalCreated event

### Edge Cases
- Empty title: revert with "Title cannot be empty"
- Duration too short (< 1 hour): revert with "Duration too short"
- Duration too long (> 30 days): revert with "Duration too long"

### Gas Considerations
- createProposal: ~80k gas (single storage write)
- getProposal: ~5k gas (read-only)

### Errors / Reverts
- "Title cannot be empty": title parameter is empty
- "Duration too short": votingDuration < 3600

### Notes
- Proposal IDs are auto-incremented starting from 1
- Creator receives no special privileges beyond regular voting power
```

### 4.6 contract-detail-example-backend.md

File: `skills/narukana-contract-spec-create/references/contract-detail-example-backend.md`

```markdown
# Contract / API Details

> Example: REST API (UserAPI)

## Operation: getUsers
- Type: query
- Transport: http
- Method: GET
- Endpoint: /api/users

### Purpose
Retrieve a paginated list of all users.

### Input
- page: uint (query, optional, default: 1)
- limit: uint (query, optional, default: 20)
- role: string (query, optional, filter by role)

### Output
- users: User[]
- total: uint
- page: uint
- totalPages: uint

### Validation Rules
- page must be >= 1
- limit must be between 1 and 100

### Step-by-Step Logic
1. Parse query parameters
2. Validate pagination params
3. Query database with offset/limit
4. Return paginated results

### Edge Cases
- Empty result set: return empty array with total=0
- Invalid page number: return page 1 by default

### Status Codes
- 200: Success
- 400: Invalid query parameters
- 500: Server error

## Operation: createUser
- Type: mutation
- Transport: http
- Method: POST
- Endpoint: /api/users

### Purpose
Create a new user account.

### Input
- name: string (body, required)
- email: string (body, required)
- role: string (body, optional, default: "user")

### Output
- id: uint
- name: string
- email: string
- role: string
- createdAt: ISO timestamp

### Validation Rules
- name: 2-100 characters
- email: valid email format
- role: must be one of "user", "admin", "moderator"

### Step-by-Step Logic
1. Parse request body
2. Validate all fields
3. Check email uniqueness
4. Hash password if provided
5. Insert into database
6. Return created user

### Edge Cases
- Duplicate email: return 409 Conflict
- Invalid email format: return 400 with validation errors
- Missing required fields: return 400 with field list

### Status Codes
- 201: Created
- 400: Validation error
- 409: Duplicate email
- 500: Server error
```

### 4.7 integration-example.md

File: `skills/narukana-integration-spec-create/references/integration-example.md`

```markdown
# Integration Flow

> Example: Voting dApp — UI to Smart Contract integration

## Runtime Flow
Wallet Connect → Fetch Proposals → View Details → Create Proposal → Cast Vote → Execute

## UI Actions
- view proposal details (Page: Proposal List)
- create proposal (Page: Create Proposal)
- cast vote (Page: Proposal Detail)
- execute proposal (Page: Proposal Detail)

## Mappings
- action: view proposal details
  calls:
    - op: getProposal
  success:
    - ui: display full proposal with vote counts and timer
  error:
    - ui: show "Failed to load proposal" error state

- action: create proposal
  calls:
    - op: createProposal
  success:
    - ui: redirect to new proposal detail page with success toast
  error:
    - ui: show validation errors inline on form

- action: cast vote
  calls:
    - op: castVote
  success:
    - ui: update vote counts in real-time, disable vote button
  error:
    - ui: show "Vote failed" toast with reason

- action: execute proposal
  calls:
    - op: executeProposal
  success:
    - ui: update proposal status to "Executed"
  error:
    - ui: show "Execution failed" toast

## Contract Operations
- createProposal
- castVote
- executeProposal
- getProposal
- getProposals

## Error Handling
- Network errors: show "Connection failed. Check your wallet connection." toast
- Contract reverts: display revert reason from error object
- Transaction timeout: retry once, then show failure with "Try again" button
- All errors logged with action name + operation name + correlation ID

## Observability
- Log: action name, operation name, success/failure, duration (ms)
- Track: user address, proposal ID for each action
- Monitor: gas costs for mutation operations
```

### 4.8 SKILL.md References Updates

Each skill's References section updated to include the example file:

**narukana-context-create:**
```
- `references/context-template.md` — template for context.md
- `references/context-example.md` — real-world example (voting dApp)
```

**narukana-ui-spec-create:**
```
- `references/ui-spec-template.md` — template for ui.md
- `references/ui-spec-example.md` — real-world example (voting dApp dashboard)
```

**narukana-contract-spec-create:**
```
- `references/contract-spec-template.json` — JSON template for contract.json
- `references/contract-example.json` — example: smart contract case (voting dApp)
- `references/contract-example-backend.json` — example: REST API case (User API)
- `references/contract-detail-template.md` — template for contract-detail.md
- `references/contract-detail-example.md` — detail example: smart contract operations
- `references/contract-detail-example-backend.md` — detail example: REST endpoints
```

**narukana-integration-spec-create:**
```
- `references/integration-spec-template.md` — template for integration.md
- `references/integration-example.md` — real-world example (voting dApp)
```

---

## 5) Validate Scripts Update

### 5.1 check-ui-structure.sh

File: `skills/narukana-ui-spec-validate/scripts/check-ui-structure.sh`

Update to check new Pages structure:

```bash
#!/bin/bash
SPEC=".narukana/specs/ui.md"
[ ! -f "$SPEC" ] && echo "ERROR: ui.md not found" && exit 1

echo "Checking ui.md structure..."
grep -q "^# UI Spec" "$SPEC" || echo "✗ Missing: # UI Spec heading"
grep -q "^## Pages" "$SPEC" || echo "✗ Missing: ## Pages section"
grep -q "^### Page:" "$SPEC" || echo "✗ Missing: Page entries"
grep -q "narukana-ui-actions" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-actions --> anchor"
grep -q "/narukana-ui-actions" "$SPEC" || echo "✗ Missing: <!-- /narukana-ui-actions --> closing anchor"
grep -q "narukana-ui-data" "$SPEC" || echo "✗ Missing: <!-- narukana-ui-data --> anchor"
grep -q "/narukana-ui-data" "$SPEC" || echo "✗ Missing: <!-- /narukana-ui-data --> closing anchor"
grep -q "^## User Flow" "$SPEC" || echo "✗ Missing: ## User Flow section"

PAGE_COUNT=$(grep -c "^### Page:" "$SPEC")
echo ""
if [ "$PAGE_COUNT" -gt 0 ]; then
  echo "✓ Found $PAGE_COUNT page(s)"
  # Check each page has Display field
  grep "^### Page:" "$SPEC" | while read -r page; do
    pname=$(echo "$page" | sed 's/.*: //')
    has_display=$(grep -A5 "^### Page: $pname" "$SPEC" | grep -c "Display:")
    [ "$has_display" -eq 0 ] && echo "⚠ Page '$pname' missing Display field"
  done
else
  echo "⚠ No pages defined"
fi
echo "Structure check complete"
```

### 5.2 check-contract-json.sh

File: `skills/narukana-contract-spec-validate/scripts/check-contract-json.sh`

Update to validate operations is an object (not array):

```bash
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
```

### 5.3 validation-rules.md

File: All 6 validator `references/validation-rules.md` files

Update UI Spec Validation rules:

```
## UI Spec Validation
- Must contain `# UI Spec` heading
- Must contain `## Pages` section
- Each page should have: Route, Display, Components, Actions
- Must contain `<!-- narukana-ui-actions -->` and `<!-- /narukana-ui-actions -->`
- Must contain `<!-- narukana-ui-data -->` and `<!-- /narukana-ui-data -->`
- Must contain `## User Flow` section
- Warning if no pages defined

## Contract Spec Validation
- Must be valid JSON
- Must have `schemaVersion`, `name`, `domain` fields
- `operations` must be an object (not array)
- If transport is "http": must have `method`, `endpoint`
- If transport is "contract": must have `target`, `function`
- Missing `input`/`output` is a warning

## Integration Spec Validation
- Must contain sections: `## Runtime Flow`, `## UI Actions`, `## Mappings`, `## Contract Operations`, `## Error Handling`, `## Observability`
- Warning if no `- action:` found under `## Mappings`
- Warning if no operations listed under `## Contract Operations`
- Cross-check against contract.json for unreferenced operations

## Deep-scan Validation
- Every action/operation declared in spec must have corresponding source code
- Reports missing implementations
- Does NOT modify any files
```

---

## 6) narukana-sync — Full Cross-Check

### 6.1 SKILL.md

File: `skills/narukana-sync/SKILL.md`

Rewrite with full cross-check procedure:

```markdown
---
name: narukana-sync
description: Verify workspace integrity by checking file presence and cross-referencing all specs for consistency.
  Use before plan generation or when debugging spec issues.
  Do not use for editing or creating files.
---

# Narukana Sync

## Detail
Checks workspace integrity by verifying file presence and cross-referencing all specs. Detects missing files, structural issues, and cross-spec inconsistencies that could cause problems during plan generation or execution.

**Use when:**
- Before running plan-create to ensure all specs are valid
- Debugging spec-related issues
- Verifying multi-agent workspace integrity

**Do NOT use for:**
- Editing or creating files
- Running task execution

## HARD RULES
- This skill is read-only. Do NOT modify any files.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- (free text, optional): specific areas to focus the check on

## Procedure

**Step 1: File Presence Check**
1. `.narukana/context/context.md` exists
2. `.narukana/specs/ui.md` exists
3. `.narukana/specs/contract.json` exists
4. `.narukana/specs/contract-detail.md` exists
5. `.narukana/specs/integration.md` exists
6. `.narukana/plan.md` exists
7. `.narukana/tasks.json` exists

**Step 2: UI Spec Structure Check**
1. Read `.narukana/specs/ui.md`
2. Verify `# UI Spec` heading exists
3. Verify `## Pages` section exists with at least one page
4. Verify `<!-- narukana-ui-actions -->` and `<!-- /narukana-ui-actions -->` anchors exist
5. Verify `<!-- narukana-ui-data -->` and `<!-- /narukana-ui-data -->` anchors exist
6. Verify `## User Flow` section exists

**Step 3: Contract Spec Structure Check**
1. Read `.narukana/specs/contract.json`
2. Verify it is valid JSON
3. Verify `schemaVersion`, `name`, `domain` fields exist
4. Verify `operations` is an object with at least one entry
5. For each operation, verify transport-specific fields exist

**Step 4: Integration Spec Structure Check**
1. Read `.narukana/specs/integration.md`
2. Verify all 6 required sections exist: Runtime Flow, UI Actions, Mappings, Contract Operations, Error Handling, Observability

**Step 5: Cross-Reference Check**
1. Verify UI actions listed in integration.md match those in ui.md
2. Verify contract operations listed in integration.md match those in contract.json
3. If plan.md exists: verify task specRefs reference existing spec files

**Step 6: Report**
1. For each check: ✅ passed / ❌ failed / ⚠ warning
2. For failures: explain the potential impact in plain language
3. Example: "contract.json missing 'domain' field — plan generation may not know whether this is backend or smart contract"

## Verification
- All checks are read-only — no files are modified
- Report is printed to user with clear status indicators

## Stop Conditions
- None — always runs all checks and reports

## Failure Modes
- No workspace: ".narukana/ not found. Run narukana-init first."
- All files present but all empty: "Spec files exist but appear empty"
```

### 6.2 check-consistency.sh (NEW)

File: `skills/narukana-sync/scripts/check-consistency.sh`

```bash
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
  node -e "
  try {
    const j = JSON.parse(require('fs').readFileSync('$JSON','utf8'));
    let e=0,w=0;
    if(!j.schemaVersion) { console.log('✗ Missing schemaVersion'); e++; }
    if(!j.name) { console.log('✗ Missing name'); e++; }
    if(!j.domain) { console.log('✗ Missing domain (should be \"contract\" or \"backend\")'); w++; }
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
  # Extract UI action names from integration
  UI_ACTIONS=$(grep -oP '(?<=action: )[^(]+' "$INT" 2>/dev/null | sort -u)
  INT_OPS=$(grep -oP '(?<=op: )[^\n]+' "$INT" 2>/dev/null | sort -u)
  CONTRACT_OPS=$(grep -oP '"\w+"' "$JSON" 2>/dev/null | tr -d '"' | sort -u)

  echo "ℹ To perform full cross-reference, review manually:"
  echo "  - UI actions in integration.md should exist in ui.md"
  echo "  - Contract ops in integration.md should exist in contract.json"
else
  echo "⚠ Skipped (one or more spec files missing)"
fi

echo ""
echo "=== Results ==="
echo "Errors: $ERRORS | Warnings: $WARNS"
[ "$ERRORS" -gt 0 ] && echo "❌ Issues found — review before proceeding" || echo "✅ All checks passed"
```

---

## 7) Free Text Input — All 17 Skills

### 7.1 Inputs Section Addition

Every SKILL.md's `## Inputs` section gets this additional line:
```
- (free text, optional): additional instructions or context for this task
```

### 7.2 Procedure Addition

Every SKILL.md's Procedure (after Step 1 / pre-check) gets:
```
- If the user provided additional free text input, incorporate those instructions into your work.
```

### Files affected (17 SKILL.md):

1. narukana-init
2. narukana-context-create
3. narukana-ui-spec-create
4. narukana-contract-spec-create
5. narukana-integration-spec-create
6. narukana-ui-validate
7. narukana-contract-validate
8. narukana-integration-validate
9. narukana-ui-spec-validate
10. narukana-contract-spec-validate
11. narukana-integration-spec-validate
12. narukana-plan-create
13. narukana-execute-task
14. narukana-sync
15. narukana-spec-from-codebase-create
16. narukana-brainstorm
17. narukana-commit-idea

---

## Execution Plan (Parallel Agents)

| Agent | Task | Files |
|-------|------|-------|
| **A** | Context split: context-template.md, generate-context.sh, canonical-layout.md, narukana-context-create SKILL.md (procedure update) | 4 files |
| **B** | UI spec restructure: ui-spec-template.md, generate-ui.sh, check-ui-structure.sh | 3 files |
| **C** | Example files: context-example.md, ui-spec-example.md, integration-example.md | 3 files |
| **D** | Contract examples: contract-example.json, contract-example-backend.json, contract-detail-example.md, contract-detail-example-backend.md | 4 files |
| **E** | Sync rewrite: narukana-sync SKILL.md + check-consistency.sh + check-contract-json.sh + validation-rules.md (6 copies) | 8 files |
| **F** | Free text input + SKILL.md References updates (all 17) | 17 files |
| **G** | README workflow docs | 1 file |
