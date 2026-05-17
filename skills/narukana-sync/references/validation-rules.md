# Validation Rules

## File Presence
- `.narukana/context/context.md` must exist
- `.narukana/specs/ui.md` must exist
- `.narukana/specs/contract.json` must exist
- `.narukana/specs/contract-detail.md` must exist
- `.narukana/specs/integration.md` must exist
- `.narukana/plan.md` must exist
- `.narukana/tasks.json` must exist

## UI Spec Structure
- Must contain `# UI Spec` heading
- Must contain `## Pages` section with at least one page
- Each page should have: Route, Display, Components, Actions
- Must contain `<!-- narukana-ui-actions -->` and `<!-- /narukana-ui-actions -->`
- Must contain `<!-- narukana-ui-data -->` and `<!-- /narukana-ui-data -->`
- Must contain `## User Flow` section

## Contract Spec Structure
- Must be valid JSON
- Must have `schemaVersion`, `name` fields
- `operations` must be an object with at least one entry
- Each operation must have: `type`, `transport`
- If transport is "http": must have `method`, `endpoint`
- If transport is "contract": must have `target`, `function`
- If transport is "ws": must have `endpoint`; `event` is optional

## Integration Spec Structure
- Must contain sections: `## Runtime Flow`, `## UI Actions`, `## Mappings`, `## Contract Operations`, `## Error Handling`, `## Observability`

## Cross-Reference
- UI actions in integration.md must match those in ui.md
- Contract operations in integration.md must match those in contract.json
- Task specRefs in plan.md must reference existing spec files
