# TDD Flow

## Overview

When `--tdd` is set, the implementation step follows acceptance-test-first:
each acceptance criterion drives one test, then minimal production code.
Tests are proper, permanent, and stored in the codebase.

## Principle

```
For each acceptance criterion:
  RED      → Write one test for this criterion
  Verify   → Run test, confirm it FAILS for the right reason
  GREEN    → Write minimal production code to pass
  Verify   → Run all tests, confirm they PASS
  REFACTOR → Clean up while keeping tests green
```

## Step-by-Step

### 1. RED — Write Failing Test

Write one test that represents ONE acceptance criterion.

**Requirements:**
- One behavior per test
- Clear test name describing the criterion
- Test uses real code (not mocks unless unavoidable)

### 2. Verify RED — Watch It Fail

**MANDATORY.** Run the test. Confirm:
- Test fails (not errors)
- Failure message matches expectation
- Fails because feature missing, not typos

If test passes → you're testing existing behavior. Fix test.
If test errors → fix error, re-run until it fails correctly.

### 3. GREEN — Minimal Code

Write simplest production code to pass the test.
Do NOT add features beyond what the test requires.

### 4. Verify GREEN — Watch It Pass

**MANDATORY.** Run all tests. Confirm:
- New test passes
- Other existing tests still pass

If test fails → fix code, not test.
If other tests fail → fix now.

### 5. REFACTOR — Clean Up

After green only:
- Remove duplication
- Improve names
- Extract helpers
- Keep tests green. Don't add behavior.

### 6. Repeat

Move to the next acceptance criterion. Continue until all criteria are met.

## Notes

- Tests are **proper and permanent** — stored in the codebase alongside production code.
- This is NOT a full test suite. Edge cases, error paths, and comprehensive coverage belong in a separate task.
- If a task's acceptance criteria cannot be meaningfully tested (e.g., configuration, static assets), skip TDD and implement directly.
