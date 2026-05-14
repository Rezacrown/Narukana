# Scanner Patterns

## UI Code Detection
- Files: **/*.{ts,tsx,js,jsx}
- Detect: component definitions, page routes, event handlers
- Extract: component names, action names, API call patterns

## Backend Code Detection
- Runtime: Node.js, Python, Go, Rust
- Files: **/*.ts, **/*.js, **/*.py, **/*.go, **/*.rs
- Detect: route handlers, controllers, service functions

## Smart Contract Code Detection
- Solidity: **/*.sol — contracts, functions, events, state variables
- Cairo: **/*.cairo — traits, functions, events
- Vyper: **/*.vy — contracts, functions, events
- Move: **/*.move — modules, functions, events
- Rust ink!: **/*.rs — contracts, messages, events

## Integration Detection
- Search for: import/require of contract ABIs, ethers/web3 calls
- Cross-reference: UI action names with contract function names

## Workflow
1. Scan without writing (preview mode)
2. Show extracted inventory to user
3. On confirmation, generate all 5 spec files
4. Do NOT overwrite existing specs unless --regenerate is set
