# Track 3 · `dependency-auditor`

> **You are not fixing the app. You are authoring a Skill** that runs `npm audit` against `zava-storefront/security-fixtures/`, parses the JSON, ranks issues by severity, and emits a remediation plan as a PR comment — with safe-bump vs. breaking-bump split.

⏱️ **90 min**

---

## 📚 Theory anchor

- **Live:** [Architectural Patterns Rosetta Stone — *Triage / classifier patterns*](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html)
- **Live:** [The PROSE Specification](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch12-the-prose-specification.html)

**Local fallback (3 sentences):** A dependency auditor is a *classifier with a fixed schema*. *Orchestrated Composition* applies — your Skill calls a deterministic tool (`npm audit --json`), then the LLM does only what humans hate doing: reading 50 advisories and producing a triaged plan. *Safety Boundaries* matter twice: never modify `package.json` directly (recommend, don't apply); never invent CVE IDs.

> ⚠️ The audit runs against `zava-storefront/security-fixtures/`, a **standalone, intentionally-vulnerable npm package** that's not imported by the application. See its [README](https://github.com/DevExpGbb/zava-storefront/blob/workshop-v1/security-fixtures/README.md).

---

## 🔍 Discover the problem

Run the raw tool yourself first. Use `--prefix` so cwd doesn't matter (and so you can never accidentally install fixture deps into the real app):

```bash
npm install --prefix zava-storefront/security-fixtures --no-audit --no-fund
npm audit --prefix zava-storefront/security-fixtures || true
```

> 💡 **`npm audit` exits non-zero when vulnerabilities are present** (i.e., always on this fixture). Append `|| true` in shell, or read `metadata.vulnerabilities.total` from `--json` — never trust the exit code alone in your Skill or in CI. Chaining with `&&` will short-circuit the rest of your pipeline.

You'll see a wall of advisories — `lodash` prototype pollution, `axios` SSRF, `minimist`. Now ask your AI chat assistant:

> "Fix the npm audit issues."

Observe:

- It might suggest `npm audit fix --force` (potentially breaking).
- It rarely splits *safe bumps* from *major-version bumps*.
- It doesn't produce something you can paste into a change-management ticket.

A Skill closes that gap.

---

## 🧠 Design with Genesis (5 min)

```
/genesis I want a dependency-auditor skill. It must:
- Run `npm audit --json` in zava-storefront/security-fixtures/
- Parse the JSON and rank vulnerabilities by severity (critical > high > moderate > low)
- For each entry under the top-level `vulnerabilities` object, classify the recommendation:
    safe-bump      → fixAvailable is an object AND fixAvailable.isSemVerMajor === false
    breaking-bump  → fixAvailable is an object AND fixAvailable.isSemVerMajor === true
    fix-via-force  → fixAvailable === true (boolean): a fix exists but npm did not
                     return a target version because the bump is at the top level
                     and requires `npm audit fix --force`. Treat as breaking until
                     a human inspects.
    manual-review  → fixAvailable === false (or missing)
- Emit a markdown report: top 5 critical findings, recommended bumps, and a "manual review" list
- Refuse to modify package.json itself — the Skill's output is a recommendation, not a code change

Draw an ASCII art diagram of the proposed skill architecture. Use this shape:
  User goal → Skill trigger → Inputs → Workflow → Verification → Output artifact
```

> 💡 **Schema reference (npm 10+).** `npm audit --json` returns `{ auditReportVersion, vulnerabilities, metadata }`. Each entry under `vulnerabilities` exposes `severity`, `range` (vulnerable range), and `fixAvailable` — one of `false`, `true` (boolean: requires `--force`), or `{ name, version, isSemVerMajor }`. Classify on `fixAvailable`, not on legacy `patched_versions`. The boolean-`true` shape is rare on this fixture (today's npm registry returns objects for all three baked-in deps), but real audits across many packages will produce it — handle it.

### Reference architecture — what good looks like

Below is the canonical shape Genesis should emit for `dependency-auditor`. Yours may use different node names; what must hold is the **6-band shape** plus the **classifier rubric** as a first-class node — that rubric is the contract the eval validates against.

```
┌─ Goal ─────────────────────────────────────────────────────┐
│  Triage npm audit findings into a remediation plan        │
│  (recommend, don't apply)                                 │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Trigger ──────────────────────────────────────────────────┐
│  "Use the dependency-auditor skill on                      │
│   zava-storefront/security-fixtures/."                     │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Inputs ───────────────────────────────────────────────────┐
│  • zava-storefront/security-fixtures/package.json          │
│  • npm audit --json output (deterministic tool)            │
│  • classifier-rubric (4 branches, see Workflow)            │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Workflow (classifier pipeline) ───────────────────────────┐
│  1. npm install --prefix <fixtures> --no-audit --no-fund   │
│  2. npm audit --json --prefix <fixtures> || true           │
│  3. parse → for each entry under .vulnerabilities:         │
│       fixAvailable === false        → MANUAL-REVIEW        │
│       fixAvailable === true (bool)  → FIX-VIA-FORCE        │
│       fixAvailable.isSemVerMajor    → BREAKING-BUMP        │
│       else                          → SAFE-BUMP            │
│  4. rank by severity (critical > high > moderate > low)    │
│  5. emit markdown report (strict schema)                   │
│  6. NEVER edit package.json (allowed-tools forbids Edit)   │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Verification ─────────────────────────────────────────────┐
│  • Live: lodash, axios, minimist all classified            │
│  • Eval: 4-branch fixture passes (apm run eval-track-3)    │
│  • allowed-tools enforcement: zero file mutations          │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Output artifact ──────────────────────────────────────────┐
│  • Markdown report (PR comment-shaped):                    │
│    - severity counters (🔴🟠🟡🟢)                          │
│    - top findings table (severity / pkg / current /        │
│      patched / bump-kind)                                  │
│    - manual-review list with rationale                     │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Build (25 min) — *generate the skill, don't hand-type it*

> 🚫 **Don't open `.apm/skills/my-skill/SKILL.md` and start typing.** That placeholder is a marker for `apm install`, not a skeleton. Your real skill is a NEW folder, *generated by your harness from Genesis's design*.

### 1. Ask your harness to generate the skill

In the same chat where Genesis just emitted the design, instruct your harness:

```
Generate the dependency-auditor skill at .apm/skills/dependency-auditor/
following the Genesis design above. Use SKILL.md frontmatter conventions
from .github/instructions/prose-style.md (installed by apm install from
code-kit): allowed-tools = Read, Bash(npm:*), Bash(jq:*) — NO Edit (the
skill cannot modify code), trigger on package.json PRs or explicit
invocation, classifier rubric inlined verbatim (4 branches), strict
output schema (severity counters / top findings table / manual-review
list).
```

Your harness writes `.apm/skills/dependency-auditor/SKILL.md`. **Review the classifier-rubric block carefully** — it's the source of truth the eval (in §Validate below) regression-tests against.

### 2. Iterate on the *design*, not the implementation

If the generated rubric loses a branch (typically `fix-via-force` — easy to skip), don't patch SKILL.md. Tweak the Genesis prompt (re-list all four branches explicitly), regenerate.

### 3. Sanity-check the generated SKILL.md

- `allowed-tools`: `Read, Bash(npm:*), Bash(jq:*)` — no `Edit`. **The Skill cannot modify code.**
- "When to use": triggered explicitly or on `package.json` PRs. Refuse if no `package.json` is present.
- Output schema (be strict — the eval asserts this exactly):
  ```
  ## Audit summary (security-fixtures)
  - 🔴 critical: N · 🟠 high: N · 🟡 moderate: N · 🟢 low: N

  ## Top findings
  | severity | package | current | patched | bump-kind |
  |---|---|---|---|---|

  ## Manual review
  - <package>: <why no auto-recommendation>
  ```

If `allowed-tools` includes `Edit`, fix the Genesis prompt and regenerate — the eval and the live oracle both rely on this skill being read-only.

📁 Stuck? See [`docs/golden-examples/dependency-auditor.SKILL.md`](../golden-examples/dependency-auditor.SKILL.md).

---

## ✅ Validate locally (5 min)

> "Use the dependency-auditor skill on `zava-storefront/security-fixtures/`."

Expect a report listing at minimum:

- 1 high or critical advisory each for `lodash`, `axios`, `minimist`
- Bump recommendations split safe / breaking
- No modifications to any `package.json`

### Demonstrate MANUAL-REVIEW classification

The three baked-in fixtures all have fixes (`safe-bump` / `breaking-bump`). To exercise the third branch — `manual-review` (`fixAvailable === false`) — feed the Skill a synthetic snippet:

```bash
cat <<'EOF' > /tmp/manual-review-fixture.json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "abandoned-pkg": {
      "severity": "high",
      "range": "*",
      "fixAvailable": false
    }
  },
  "metadata": { "vulnerabilities": { "high": 1, "critical": 0, "moderate": 0, "low": 0 } }
}
EOF
```

Then in your harness:

> "Use the dependency-auditor skill on the npm-audit JSON at `/tmp/manual-review-fixture.json`."

Expected output: `abandoned-pkg` lands under **Manual review**, with rationale `fixAvailable === false — no automated remediation; investigate upstream`. If it lands under safe-bump or breaking-bump instead, your classifier rubric is mis-ordered — fix the SKILL.md and retry. This is exactly the kind of off-happy-path case the eval fixture in §Validate covers; **see it once by hand here so you trust the eval afterwards**.

### Run the deterministic eval (regression check)

Once your Skill produces a clean live report and a clean MANUAL-REVIEW report by hand, run the harness — it asserts the exact classifications + fix versions the rubric should produce, including all four branches (`safe-bump`, `breaking-bump`, `fix-via-force`, `manual-review`):

```bash
apm run eval-track-3       # → ✅ dependency-auditor eval PASSED
```

Mirrors Track 4's `evals/run.js` pattern — pure Node, no deps, runs in <2s. Read [`docs/golden-examples/dependency-auditor.evals/README.md`](../golden-examples/dependency-auditor.evals/README.md) for the maintenance contract (the rubric in your SKILL.md and the harness's `classify()` function are a single source of truth split across two files; they move together).

---

## 📦 Package + publish (15 min)

```bash
apm run validate
git add . && git commit -m "feat: dependency-auditor skill v0.1.0"

# If you ran multiple tracks in the same repo, scope the tag:
git tag v0.1.0-dependency-auditor   # or just v0.1.0 if this is your only track
git push origin main --tags
```

> 💡 **Tag collision warning.** Every track guide says `git tag v0.1.0`. If you re-run or run multiple tracks in the same repo, scope per-track (`v0.1.0-dependency-auditor`) or delete the old tag first.

---

## 🌐 Automate (15 min)

Wire the workflow to run on PRs touching any `package.json`. The Skill posts the audit report as a PR comment. **It does not auto-merge or auto-bump.** That's the auditor's whole point.

```bash
# 1 · Create the trigger label first (silent failure otherwise):
gh label create run-dependency-auditor --color FFB0B0 --description "Run the dependency-auditor skill on this PR"

# 2 · Edit .github/workflows/my-workflow.md to:
#     on:
#       pull_request:
#         types: [labeled]
#         paths: ['**/package.json']
#     # with an `if: github.event.label.name == 'run-dependency-auditor'` guard.

# 3 · Compile + commit:
gh aw compile
git add .github/workflows/ && git commit -m "ci: compile dependency-auditor workflow"
git push
```

---

## 🌍 Platform payoff (your Skill in someone else's repo)

After §6 of the README, a partner team can pin your auditor in *their* repo:

```yaml
# their apm.yml
dependencies:
  apm:
    - <your-org>/<your-repo>#v0.1.0-dependency-auditor
```

`apm install` and they have the same `SKILL.md`, the same read-only `allowed-tools`, the same report schema. Their CI now produces audit reports identical in structure to yours — that's how a skill becomes shared platform capability rather than a single-repo script.

---

## 🎓 What you learned

- **Classifier Skills compose with deterministic tools.** The LLM does the triage, not the scanning.
- **`allowed-tools` is the strongest safety lever.** No `Edit` → can't modify `package.json` → can't ship a breaking bump by accident.
- **Output schemas matter.** A predictable report is the difference between "useful" and "another bot comment."
