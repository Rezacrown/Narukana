# Memory Format

memory.md is a derived brief for fresh agent sessions.

## Frontmatter (YAML)
---
schemaVersion: 1
planId: <sha256 hash of plan.md content>
generatedAt: <ISO timestamp>
sources:
  contextHash: <sha256 prefix>
  uiSpecHash: <sha256 prefix>
  contractHash: <sha256 prefix>
  integrationSpecHash: <sha256 prefix>
  planHash: <sha256 prefix>
---

## Body sections
- **Project Snapshot**: plan ID, total tasks, context highlights
- **UI Actions Summary**: actions from ui.md
- **Contract Operations Summary**: operations from contract.json
- **Integration Mapping Summary**: mappings from integration.md
- **Execution Rules**: source of truth reminders, regeneration guidance
- **Current Task State**: counts by status (todo, in_progress, done, etc.)
- **Known Risks / Open Questions**: from context.md
- **Fresh Agent Checklist**: verify planId, check task state, claim work
