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
