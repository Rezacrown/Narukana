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
