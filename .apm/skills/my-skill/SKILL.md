---
name: my-skill
description: >-
  TODO — replace this placeholder with a one-line, action-verb description
  of what your skill does. The Genesis assistant (pinned in apm.yml) will
  help you scope this. See README "Build" section.
license: UNLICENSED
allowed-tools: Read, Grep, Glob, Bash(npm:*), Bash(node:*)
---

# My Skill

> **Workshop placeholder.** Delete everything below and write your skill
> here. Keep it scoped, progressive, and PROSE-shaped (see the
> `code-kit/instructions/prose-style.md` instruction pinned via apm.yml).

## When to use this skill

TODO — describe the trigger conditions. Be specific. "When to use" is
how the orchestrator decides to call you.

## What this skill does

TODO — three to five short numbered steps. Each step should be
imperative ("Run X", "Inspect Y", "Emit Z"). Defer detail to
referenced files in the same skill folder rather than expanding inline.

## Outputs

TODO — what artifacts does this skill produce? Files? Comments? Labels?

## Examples

TODO — at least one concrete invocation example. Trainees demoing your
skill on `sample-app/` will appreciate this.

---

### Suggested skills to build during the workshop

- **test-improver** — read `sample-app/src/calculator.ts`, generate the
  missing tests in `sample-app/tests/calculator.test.ts`, run `npm test`,
  iterate until green.
- **docs-generator** — read `sample-app/src/calculator.ts`, emit a
  `sample-app/README.md` with usage examples.
- **dependency-auditor** — scan `sample-app/package.json` for outdated
  or vulnerable deps and emit a remediation comment.

Pick one. Build it. Then run it via the `gh aw` workflow at
`.github/workflows/my-workflow.md` to see the inner→outer loop transition.
