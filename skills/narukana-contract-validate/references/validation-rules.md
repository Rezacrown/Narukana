# Validation Rules

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
- Must have `schemaVersion`, `name` fields
- Each operation must have: `type`, `transport`
- If transport is "http": must have `method`, `endpoint`
- If transport is "contract": must have `target`, `function`
- If transport is "ws": must have `endpoint`; `event` is optional
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
