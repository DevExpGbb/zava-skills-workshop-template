---
name: dependency-auditor
description: |
  Run `npm audit --json` against target-app/security-fixtures/, parse the result,
  rank advisories by severity, classify each as safe-bump vs breaking-bump, and
  emit a markdown remediation report. Never modify package.json.
license: MIT
allowed-tools: Read, Bash(npm:*), Bash(jq:*)
---

# dependency-auditor

## When to use this skill

Invoke when:

- The user asks for a security audit of `target-app/security-fixtures/`
- A PR modifies `target-app/security-fixtures/package.json` or `target-app/package.json`

Do not invoke for: source code changes, lockfile-only changes, or repos without a `package.json`.

## Steps

1. Run `npm install --prefix target-app/security-fixtures --no-audit --no-fund` to ensure dependencies are present.
2. Run `npm audit --prefix target-app/security-fixtures --json` and capture stdout.
3. Parse the JSON. The relevant shape (npm 10+) is:
   ```
   {
     "auditReportVersion": 2,
     "vulnerabilities": {
       "<package>": {
         "severity": "low | moderate | high | critical",
         "range": "<vulnerable semver range>",
         "fixAvailable": false | { "name": "<pkg>", "version": "<x.y.z>", "isSemVerMajor": true|false }
       }
     }
   }
   ```
4. For each entry under `vulnerabilities`, classify:
   - **safe-bump** — `fixAvailable` is an object AND `fixAvailable.isSemVerMajor === false`
   - **breaking-bump** — `fixAvailable.isSemVerMajor === true`
   - **manual-review** — `fixAvailable === false` (or missing)
5. Produce the report below. Top-5 critical/high findings only in the headline table; full list in a collapsible details block.

## Output schema (strict)

```
## Audit summary (security-fixtures)
- 🔴 critical: N · 🟠 high: N · 🟡 moderate: N · 🟢 low: N

## Top findings
| severity | package | vulnerable range | fix version | bump-kind |
|---|---|---|---|---|
| critical | minimist | <=0.2.3 | 1.2.8  | breaking-bump |
| critical | lodash   | <=4.17.20 | 4.17.21 | safe-bump |
| high     | axios    | <=0.21.0 | 0.21.4 | safe-bump |

## Manual review
- <package>: fixAvailable === false — no automated remediation; investigate upstream

## Recommended next step
- Apply safe-bumps with `npm install --prefix target-app/security-fixtures <pkg>@<version>` (always use `--prefix` — never run from the wrong cwd or you risk polluting the real app's `package.json`).
- Open separate PRs for breaking-bumps; pair each with regression tests.
```

## Constraints

- Never modify any `package.json` — this skill outputs recommendations, not patches
- Never run `npm audit fix` or `--force`
- Never invent CVE IDs, advisory URLs, or patched versions
- The report must be valid markdown that pastes cleanly into a PR comment

## Example invocation

> Use the dependency-auditor skill on `target-app/security-fixtures/`.
