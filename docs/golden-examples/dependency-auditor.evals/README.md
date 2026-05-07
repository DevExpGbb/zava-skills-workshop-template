# `dependency-auditor` eval harness

Mirror of Track 4's `evals/run.js` pattern, ported to Track 3.

## Why this exists

Trainees building the dependency-auditor Skill on Track 3 previously had no
shippable way to validate their classification logic — the only oracle was
"did you eyeball the markdown?" That's not defensible in a regulated shop
(Senior persona finding, V3 panel) and it's asymmetric with Track 4.

This harness asserts two things:

1. **Live npm registry behavior** matches the documented rubric. Runs
   `npm audit --json` against `zava-storefront/security-fixtures/`, applies
   the rubric verbatim, and diffs against `expected/classifications.txt`.

2. **All four classification branches** are exercised. The live fixture only
   exercises `safe-bump` + `breaking-bump` because today's npm registry
   returns object-shaped `fixAvailable` for all three baked-in deps. The
   synthetic fixture in `fixtures/manual-review-fixture.json` covers the
   other two: `fix-via-force` (boolean `true`) and `manual-review` (`false`).

## Running

From the workshop repo root:

```bash
node docs/golden-examples/dependency-auditor.evals/run.js
```

Exits 0 on match, 1 on mismatch with a diff. No npm/yarn deps — pure Node.

It's also wired into `apm run validate-track-3` (see `apm.yml`).

## When this fails

**[1/2] live audit failed:** The npm advisory database has likely evolved
since the fixture was pinned. Three deliberate paths:

- **Patched version drifted** (e.g. lodash 4.18.1 → 4.18.2): update the
  third column in `expected/classifications.txt`.
- **Severity reclassified** (e.g. high → critical): update the second column.
- **Branch type changed** (e.g. object → boolean true): the SKILL rubric is
  now under-specified for this advisory. Update both the SKILL prose and
  this expected file in the same PR.

Always update the SKILL rubric prose and this file together — they are a
single source of truth split across two files.

**[2/2] synthetic failed:** Someone changed `classify()` in `run.js` without
updating `expected/synthetic.txt`. Re-derive expected from the rubric.

## Maintenance contract

`run.js`'s `classify()` function MUST stay byte-for-byte aligned with lines
39-43 of `docs/golden-examples/dependency-auditor.SKILL.md`. The skill is
the spec; this is the executable check.
