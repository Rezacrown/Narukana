# Plan Format

A plan.md follows this structure:

## Directive
A single sentence describing the build objective.

## Goal
The overall purpose — why this project exists, what problem it solves.

## Scope

### In Scope
- What the plan covers

### Out of Scope
- What is explicitly excluded (from context.md Non-Goals)

## Phases

### Phase N: Phase Title
- T-001

## Tasks

### T-001: Task Title
- DependsOn: T-XXX (comma-separated task IDs this depends on)
- SpecRefs: ui.md, contract.json
- RiskTags: (comma-separated)
- Phase: N

#### Acceptance
- (condition that must be met)

#### Verification
- (how to verify completion)
