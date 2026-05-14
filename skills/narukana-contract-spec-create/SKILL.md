---
name: narukana-contract-spec-create
description: Creates or regenerates the `contract.json` and `contract-detail.md` specification files in `.narukana/specs/` with contract operations, events, access control, and error handling. Triggered on requests to document smart contract specifications, define contract operations and events, create contract ABIs or JSON specs, or set up contract detail documentation. Not triggered for editing individual contract operations or events in an existing spec.
---

# Narukana Contract Spec Create

## Detail
Creates or regenerates the contract/API specification (`contract.json` and `contract-detail.md`). Supports both backend REST APIs and smart contracts, distinguished by the `transport` field.

**Use when:**
- Defining backend API endpoints or smart contract functions
- Documenting operations, inputs, outputs, and error handling

**Do NOT use for:**
- UI specification work
- Creating integration mappings

## HARD RULES
- Let the agent handle all `.narukana/` file operations as instructed in the procedure below.
- When in doubt or on error — STOP and ask the user.
- If any step is unclear or ambiguous → STOP and ask the user. Do not assume or guess intent.

## Inputs
- `--regenerate`: Overwrite the existing `contract.json` and `contract-detail.md` files
- (free text, optional): additional instructions or context for this task

## Procedure
1. Pre-check: if `.narukana/specs/contract.json` and `.narukana/specs/contract-detail.md` exist and `--regenerate` was NOT passed, STOP and inform the user.
- If the user provided additional instructions, incorporate them into your work.
2. Read `references/contract-spec-template.json` for the JSON format.
3. Read `references/contract-detail-template.md` for the detail markdown format.
4. Using the Write tool, create `.narukana/specs/contract.json` with the JSON spec filled in from user-provided information.
5. Using the Write tool, create `.narukana/specs/contract-detail.md` with the detail spec filled in from user-provided information.
6. Verify both files exist and that `contract.json` contains valid JSON (parse with `jq` or `python -m json.tool`).

## Verification
- `.narukana/specs/contract.json` exists
- `.narukana/specs/contract-detail.md` exists
- `contract.json` parses as valid JSON
- `contract.json` contains `"schemaVersion"` field
- `contract.json` contains `"name"` field
- `contract.json` contains `"operations"` array
- `contract-detail.md` contains `# Contract Detail` heading
- `contract-detail.md` contains `## Functions` heading
- `contract-detail.md` contains `## Events` heading

## References
- `references/contract-spec-template.json` — JSON template for contract.json
- `references/contract-example.json` — example: smart contract case (voting dApp)
- `references/contract-example-backend.json` — example: REST API case (User API)
- `references/contract-detail-template.md` — template for contract-detail.md
- `references/contract-detail-example.md` — detail example: smart contract operations
- `references/contract-detail-example-backend.md` — detail example: REST endpoints

## Scripts
- `scripts/generate-contract.sh` — Creates minimal `contract.json` and `contract-detail.md` files with placeholder content. Usage: `bash scripts/generate-contract.sh`.

## Stop Conditions
- Both spec files already exist and `--regenerate` was not provided

## Failure Modes
- File write fails — check permissions and disk space
- `contract.json` is not valid JSON — verify the template structure was followed
- One file was created but the other was not — check for partial write errors
