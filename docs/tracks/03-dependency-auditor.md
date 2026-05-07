# Track 3 · `dependency-auditor`

> Build a skill that runs `npm audit` against `sample-app/`, parses the JSON, ranks issues by severity, and emits a remediation plan as a PR comment — with safe-bump vs. breaking-bump split.

⏱️ **45 min** · 🎯 **PROSE focus:** **O**rchestration (read → analyze → plan → emit)

---

## 🔍 Discover the problem

```bash
cd sample-app && npm audit
```

You'll see real CVEs:

- `lodash@4.17.4` → prototype pollution (CVE-2019-10744)
- `axios@0.21.0` → SSRF + ReDoS
- `minimist@0.0.8` → prototype pollution (×2)

Now ask Copilot Chat (no skill):

> "Fix the npm audit issues in sample-app/"

Observe:

- Does it tell you which fixes are safe (patch/minor) vs breaking (major)?
- Does it show you the upstream changelog risk?
- Does it offer a single `npm audit fix` (which may break) vs. a tracked plan?

**Auditing is mechanical. Remediation is judgment.** A skill can do the mechanical part deterministically and hand judgment to humans with a structured plan.

---

## 🧠 Design with Genesis (5 min)

```
/genesis I want a dependency-auditor skill. It must:
- Run `npm audit --json` in sample-app/ and parse the output
- Group findings by severity (critical / high / moderate / low)
- For each finding, classify the upgrade as: SAFE (patch/minor, no API change) or BREAKING (major version)
- Emit a markdown remediation plan: numbered list, severity badge, current version → recommended version, "safe to auto-apply" or "needs review"
- Write the plan to a file (e.g. `audit-report.md`) AND comment it on the PR if running in CI
- Never auto-apply fixes — humans approve
```

Genesis will probably suggest **two agents**: an `audit-runner` (mechanical) and a `remediation-planner` (synthesis). That's the **B1 Fan-Out + Synthesizer** pattern — keep them separate so the synthesizer doesn't inherit the runner's noise.

---

## 🛠️ Build (20 min)

In `.apm/skills/my-skill/SKILL.md` (rename to `dependency-auditor/`):

**Hard rules:**

- **`allowed-tools`:** `Bash(npm audit:*), Read, Edit` — narrow Bash to just `npm audit` to prevent the skill from running anything else.
- **"When to use":** "When the user asks for a dependency security check, OR a PR touches `package.json` / `package-lock.json`."
- **Output schema:** Define it. Make every report look the same — humans calibrate to one shape.

📁 Reference: [`docs/golden-examples/dependency-auditor.SKILL.md`](../golden-examples/dependency-auditor.SKILL.md)

---

## ✅ Validate locally (5 min)

> "Use the dependency-auditor skill on sample-app/"

Expected output: a markdown report with 3 vulnerabilities, severity-ranked, with a clear "safe to auto-apply: NO — minimist 0.0.8 → 1.2.8 is a major version bump; review CHANGELOG before merging."

Sanity check:

- Does the report match what `npm audit` says?
- Are the SAFE vs BREAKING calls correct (semver-aware)?
- Could a non-security-engineer act on this report?

---

## 📦 Package + publish (10 min)

```bash
apm run validate
git tag v0.1.0 && git push origin main --tags
```

---

## 🌐 Automate (5 min)

Adapt `my-workflow.md` to trigger on PRs touching `package.json` (no label needed — file-path trigger). Compile, commit.

Now any PR that bumps a dep gets an auditor comment automatically. You've turned a stale chore into a PR-time guardrail.

---

## 🎓 What you learned

- **Tight `allowed-tools`** keeps a skill from drifting into shell-execution risks.
- **Two-agent split** (runner + planner) keeps signal high — same content, cleaner output.
- **Skills don't decide; they propose.** The auditor never auto-applies fixes — humans approve.
