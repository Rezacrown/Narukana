import { SCHEMA_VERSION } from "./constants";

export const CONTEXT_TEMPLATE = `# Context

## Goal
Describe the desired outcome in one paragraph.

## System Overview
- What is being built?
- Who are the users?
- Where does the UI run?
- Where does the backend/contract run?

## Constraints
- Tech stack constraints
- Deployment constraints
- Performance constraints
- Security constraints

## Assumptions
- Assumptions that, if wrong, would break the design

## Non-Goals
- Explicitly list what is NOT being built

## Risks
- Biggest risks and unknowns
`;

export const IDEA_CONTEXT_TEMPLATE = `# Context

## Goal
(Generated from idea.md - please expand)

## System Overview
- What is being built?
- Who are the users?
- Where does the UI run?
- Where does the backend/contract run?

## Constraints
- Tech stack constraints
- Deployment constraints
- Performance constraints
- Security constraints

## Assumptions
- Assumptions that, if wrong, would break the design

## Non-Goals
- Explicitly list what is NOT being built

## Risks
- Biggest risks and unknowns

---

## Original Idea
(Idea content from .narukana/context/idea.md)
`;

export const UI_SPEC_TEMPLATE = `# UI Spec

## Description
A short description of the UI and what it enables.

## Layout / Components
- List primary screens/components

## States
- loading
- empty
- error
- success

<!-- narukana-ui-actions -->
- action: (define your UI actions here)
<!-- /narukana-ui-actions -->

<!-- narukana-ui-data -->
- entity: (define your data entities here)
<!-- /narukana-ui-data -->

## User Flow
1) User opens app
2) User triggers an action
3) UI calls an operation
4) UI updates state
`;

export const CONTRACT_JSON_TEMPLATE = {
  schemaVersion: SCHEMA_VERSION,
  name: "",
  domain: "",
  operations: {},
};

export const CONTRACT_DETAIL_TEMPLATE = `# Contract / API Details

> This file explains each operation from \`contract.json\` in human terms.

## Operation: (operation-name)
- Type: (query | mutation | event | job)
- Transport: (http | contract)
- Method: (GET | POST | PUT | DELETE)
- Endpoint: (/api/...)

### Purpose
Describe what this operation does.

### Input
- (input field): (type)

### Output
- (output field): (type)

### Validation Rules
- (rule — e.g., "amount must be > 0")

### Step-by-Step Logic
1. Validate inputs
2. Check preconditions
3. Execute core operation
4. Trigger side effects
5. Return result

### Edge Cases
- (case): (handling)

### Gas Considerations
- (approximate gas cost notes)

### Errors / Reverts
- (error name): (description)

### Notes
- (additional notes)
`;

export const INTEGRATION_TEMPLATE = `# Integration Flow

## Runtime Flow
UI action -> operation call -> response -> UI state update

## UI Actions
- (UI action name)

## Mappings
- action: (UI action name)
  calls:
    - op: (operation name)
  success:
    - ui: (success state update)
  error:
    - ui: (error state update)

## Contract Operations
- (operation name)

## Error Handling
- Standardize error surface to user-friendly messages

## Observability
- Log errors with action + op + correlation id
`;

export const TECHSTACK_TEMPLATE = `# Tech Stack

## Frontend
- Framework: (detected)
- Language: TypeScript / JavaScript
- Build tool: (detected)
- Key libraries: (from package.json)

## Backend
- Runtime: (detected)
- Framework: (detected)
- Database: (detected)

## Smart Contract
- Language: (detected)
- Framework: Hardhat / Foundry / etc.

## Infrastructure
- Package manager: npm / yarn / pnpm / bun
- Monorepo tool: (if detected)
`;

export const ARCHITECTURE_TEMPLATE = `# Architecture

## High-Level Structure
(Frontend) → (API/BFF) → (Backend / Smart Contract)

## Frontend Architecture
- Routing: (react-router / next.js pages / vue-router)
- State management: (redux / zustand / pinia / context)
- Data fetching: (react-query / swr / apollo / fetch)

## Backend Architecture
- API style: REST / GraphQL / tRPC
- Middleware chain: (auth → validation → controller → service → repository)

## Contract Architecture
- Network: Ethereum / StarkNet / Aptos / Sui / Polkadot
- Contract interactions: ethers.js / viem / starknet.js

## Data Flow
1. User action → API call / contract call
2. Request → middleware → handler → service
3. Response → UI state update
`;

export const PROJECT_TEMPLATE = `# Project Overview

## Repository Structure
(Directory tree summary)

## Conventions
- Naming: (detected patterns)
- File organization: (detected patterns)

## Environment
- Config files: .env, .env.example, etc.
- Environment variables: (list detected)

## Development Workflow
- Scripts: (from package.json)
- Testing: (detected test framework)
- Linting: (detected linter config)
`;