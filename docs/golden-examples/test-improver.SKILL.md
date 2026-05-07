---
name: test-improver
description: >-
  Find untested branches in JavaScript source files under sample-app/src/,
  generate node:test cases for the missing branches, and iterate with
  npm test until all branches are covered or 5 iterations elapse.
license: UNLICENSED
allowed-tools: Read, Grep, Glob, Edit, Bash(node:*), Bash(npm:*)
---

# test-improver

> Spec-driven test generation for under-tested JavaScript modules. Loops on `npm test` until convergence.

## When to use this skill

Invoke when:

- A source file under `sample-app/src/*.js` has exported functions
- The corresponding `tests/*.test.js` covers fewer than 80% of the source's branches
- The user has explicitly asked for test improvement, OR a CI workflow has triggered with the `run-test-improver` label

Do not invoke for: TypeScript sources (this version targets JS only), files outside `sample-app/`, or non-test changes.

## What this skill does

1. **Read** every `.js` file under `sample-app/src/` and identify exported functions.
2. **Compare** against tests in `sample-app/tests/` — list functions whose error paths, branch alternatives, or boundary cases are uncovered.
3. **Generate** new `node:test` cases (NOT Jest) using `import { test } from "node:test"` and `import assert from "node:assert/strict"`. Append to existing test files or create new ones following the pattern `<source>.test.js`.
4. **Run** `cd sample-app && npm test`. If failures, refine and retry.
5. **Stop** when all error paths have at least one passing test, OR after 5 iterations — whichever comes first.
6. **Emit** a summary listing what was added: file path, function covered, branch type (error / boundary / alternative).

## Outputs

- New or extended test files under `sample-app/tests/`
- One markdown summary written to `.skill-output/test-improver-summary.md` listing changes
- Exit code 0 if all branches covered; non-zero with summary if iteration cap hit

## Constraints

- Never modify files in `sample-app/src/` — this skill is read-only against the source under test
- Match the existing test style (node:test, ESM imports, `assert/strict`)
- Tests must be deterministic — no `Math.random`, no `Date.now()` without injected mocks

## Examples

```
> Use the test-improver skill on sample-app/
```

Expected: ~12+ new tests, divide-by-zero covered, factorial-of-negative covered, power-of-negative-exponent covered.
