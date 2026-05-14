# Integration Flow

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
