---
name: dependency-auditor
description: >-
  Run npm audit, classify each finding's upgrade as SAFE (patch/minor) or
  BREAKING (major), and emit a structured remediation plan. Never auto-applies.
license: UNLICENSED
allowed-tools: Read, Edit, Bash(npm audit:*), Bash(npm view:*)
---

# dependency-auditor

> Mechanical audit + judgment-aware remediation plan. Humans approve every fix.

## When to use this skill

Invoke when:

- The user asks for a dependency security check
- A PR touches `package.json` or `package-lock.json` AND a `run-dependency-auditor` label is present (or a file-path-triggered workflow fires)

Do not invoke for: source-only PRs, non-Node projects, or as part of an automated `npm audit fix` flow (this skill never applies fixes).

## What this skill does

This skill orchestrates two passes — keep them separate to maintain signal.

### Pass 1 — audit-runner

1. Run `cd sample-app && npm audit --json` and capture stdout.
2. Parse the `vulnerabilities` map. For each finding capture: package, current version, severity, advisory URL, recommended fix version.
3. Emit raw findings to `.skill-output/audit-raw.json`.

### Pass 2 — remediation-planner

1. Read `.skill-output/audit-raw.json`.
2. For each finding, classify the upgrade:
   - **SAFE** — patch or minor bump (semver-major matches current)
   - **BREAKING** — major bump (use `npm view <pkg> versions --json` to confirm)
3. Emit `.skill-output/audit-report.md` with one section per severity (Critical, High, Moderate, Low), each listing findings as a numbered list:
   - 🔴 / 🟠 / 🟡 severity badge
   - `<pkg>@<current> → <recommended>`
   - Classification (SAFE / BREAKING)
   - Action: "Safe to apply via `npm install <pkg>@<recommended>`" OR "Review CHANGELOG before bumping"
   - Advisory link
4. If the skill is running in CI, also post the report as a PR comment (single comment, replaces previous if exists).

## Outputs

- `.skill-output/audit-raw.json` — machine-readable findings
- `.skill-output/audit-report.md` — human-readable plan
- (CI only) PR comment containing the report

## Constraints

- **Never auto-apply fixes.** Humans approve.
- **Never modify `package.json` or `package-lock.json`.**
- Output schema is fixed — downstream tooling parses it. Do not improvise sections.

## Examples

```
> Use the dependency-auditor skill on sample-app/
```

Expected: a 3-finding report — `lodash@4.17.4` (high, SAFE → 4.17.21), `axios@0.21.0` (moderate, BREAKING → 1.x), `minimist@0.0.8` (critical, BREAKING → 1.2.8).
