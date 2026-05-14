# Validation Rules

## UI Spec Validation
- Must contain `# UI Spec` heading
- Must contain `<!-- narukana-ui-actions -->` and `<!-- /narukana-ui-actions -->`
- Must contain `<!-- narukana-ui-data -->` and `<!-- /narukana-ui-data -->`
- Warning if actions block is empty

## Contract Spec Validation
- Must be valid JSON
- Must have `name` (string)
- Must have `domain` (string)
- Each operation must have: `type`, `transport`
- If transport is "http": must have `method`, `endpoint`
- If transport is "contract": must have `target`, `function`
- Missing `input`/`output` is a warning

## Integration Spec Validation
- Must contain sections: `## Runtime Flow`, `## UI Actions`, `## Mappings`, `## Contract Operations`, `## Error Handling`, `## Observability`
- Warning if no `- action:` found under `## Mappings`
- Cross-check against contract.json for unreferenced operations

## Deep-scan Validation
- Every action/operation declared in spec must have corresponding source code
- Reports missing implementations
- Does NOT modify any files
