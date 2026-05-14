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
