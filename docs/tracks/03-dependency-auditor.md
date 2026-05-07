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

Draw an ASCII art diagram of the proposed skill architecture and explain the reasons of the design.
```

> 💡 **Schema reference (npm 10+).** `npm audit --json` returns `{ auditReportVersion, vulnerabilities, metadata }`. Each entry under `vulnerabilities` exposes `severity`, `range` (vulnerable range), and `fixAvailable` — one of `false`, `true` (boolean: requires `--force`), or `{ name, version, isSemVerMajor }`. Classify on `fixAvailable`, not on legacy `patched_versions`. The boolean-`true` shape is rare on this fixture (today's npm registry returns objects for all three baked-in deps), but real audits across many packages will produce it — handle it.

### What Genesis returned for this brief

Rendered in Mermaid for GitHub readability — Genesis emits ASCII into your chat. Same components, same edges. Yours may differ in naming; what must hold is the **classifier as a first-class node** with all four buckets, and the **hard safety boundary** against package.json/lockfile mutations.

```mermaid
flowchart TD
  ANCHOR[B8 ATTENTION ANCHOR<br/>npm audit exit-code lies<br/>classify on fixAvailable npm 10+]
  RUNNER[S1 RUNNER<br/>npm audit --json<br/>ignore exit code]
  PKG[(security-fixtures<br/>package.json + lock)]
  BRIDGE[S7 DETERMINISTIC TOOL BRIDGE<br/>npm audit --json call]
  PARSE[S2 JSON PARSER + VALIDATOR<br/>read metadata.vulnerabilities.total<br/>reject non-npm10+ schema]
  CLS{C1 CLASSIFIER<br/>4 buckets via fixAvailable}
  SAFE[SAFE-BUMP<br/>fixAvailable.object<br/>not isSemVerMajor]
  MAJOR[MAJOR-BUMP<br/>fixAvailable.object<br/>isSemVerMajor true]
  FORCE[FIX-VIA-FORCE<br/>fixAvailable === true]
  NOFIX[NO-FIX<br/>fixAvailable === false]
  AUDITMD[E1 AUDIT.md EMITTER<br/>severity counters<br/>findings table<br/>manual list]
  SUMMARY[E2 SUMMARY EMITTER<br/>stdout one-liner]
  OUT_MD[(AUDIT.md mutated)]
  OUT_STDOUT[(stdout)]
  DENY[B5 SAFETY BOUNDARY HARD<br/>DENY npm install<br/>DENY npm audit fix<br/>DENY package.json + lock writes]

  ANCHOR --> RUNNER
  RUNNER --> BRIDGE
  PKG ==> BRIDGE
  BRIDGE --> PARSE
  PARSE --> CLS
  CLS --> SAFE
  CLS --> MAJOR
  CLS --> FORCE
  CLS --> NOFIX
  SAFE --> AUDITMD
  MAJOR --> AUDITMD
  FORCE --> AUDITMD
  NOFIX --> AUDITMD
  SAFE --> SUMMARY
  MAJOR --> SUMMARY
  FORCE --> SUMMARY
  NOFIX --> SUMMARY
  AUDITMD ==> OUT_MD
  SUMMARY ==> OUT_STDOUT
  DENY -. "wraps every step" .-> BRIDGE
  DENY -. "wraps every step" .-> AUDITMD

  classDef external fill:#eee,stroke:#666,stroke-dasharray: 4 3;
  classDef internal fill:#fff,stroke:#000;
  classDef boundary fill:#fdd,stroke:#a44,stroke-width:2px;
  classDef anchor fill:#ffd,stroke:#aa0;
  classDef bucket fill:#dfd,stroke:#272;
  class PKG,OUT_MD,OUT_STDOUT external;
  class RUNNER,BRIDGE,PARSE,CLS,AUDITMD,SUMMARY internal;
  class DENY boundary;
  class ANCHOR anchor;
  class SAFE,MAJOR,FORCE,NOFIX bucket;
```

**Why this shape (rationale Genesis explained):**

- **A2 PIPELINE-with-classifier** (not A1 PANEL) — there are no independent lenses to synthesize. One deterministic input, one deterministic schema, four mutually exclusive buckets. Adding agents would invent disagreement that the data doesn't have.
- **B8 ATTENTION ANCHOR at the top** — `npm audit` exits non-zero on findings. The skill must *expect* non-zero and classify by JSON, not by exit code. The anchor pins this rule above every step so context drift can't dilute it.
- **C1 CLASSIFIER as first-class node** — the four buckets are the contract the eval validates against. Inventing a 5th bucket inline means the rubric is wrong, not the data.
- **B5 SAFETY BOUNDARY (hard)** — DENY-list wraps every consequential step: no `npm install`, no `npm audit fix`, no `--force`, no writes to `package.json`/lockfile/`node_modules`. Recommendation, not remediation. The boundary is rendered as a node, not buried in prose.
- **S7 DETERMINISTIC TOOL BRIDGE** — `npm audit --json` is the only authority. The LLM never re-derives severity or `fixAvailable` from recall.
- **Failure modes guarded:** classifying on `severity` instead of `fixAvailable` (anchor blocks); inferring a 5th bucket (classifier is closed); attempting `npm audit fix` because the LLM "thinks it's safe" (deny list rejects).

---

## 🛠️ Build (15 min) — *let Genesis implement what Genesis designed*

In the same chat where Genesis just emitted the design, prompt your harness:

> Now use the genesis skill to implement the skill per our agreed design.

That's it. Genesis takes over: it applies its own step-7b discipline (probe runtime, draft SKILL.md, validate against the design — including all four classifier branches and the read-only `allowed-tools` constraint). Any installed instructions — like `prose-style.md` from `code-kit` — get loaded by the harness automatically.

Review the output node-for-node against the design diagram — especially the classifier rubric (the eval in §Validate regression-tests against it) and the absence of `Edit` from `allowed-tools` (the skill must not be able to mutate code).

### Iterate naturally

The high-leverage moves aren't tweaks to the *original* prompt — they're new asks that build on what Genesis just shipped. Each one shows Genesis applying its own discipline to a real evolutionary need:

- **Add evals.** *"Use the genesis skill to add evals for this skill."* Genesis proposes the eval harness — fixture set covering all four classifier branches, expected outcomes per row. The regression contract that catches a rubric drift the next time you tweak the prompt.
- **Make it run in CI/CD.** *"Use the genesis skill to make this run in CI/CD."* Genesis proposes a [`gh-aw`](https://githubnext.com/projects/agentic-workflows/) agentic workflow — paths filter on `package.json`/`package-lock.json`, the same audit running on every dependency PR.
- **Modularize the specialist personas.** *"Use the genesis skill to modularize the specialist personas as a separate apm package."* Genesis proposes a package split — pulls the supply-chain risk persona into its own pinnable APM package shared with `secure-baseline`.

That's the loop you'll keep using long after the workshop: the skill grows by composition, not by hand-edits.

📁 Stuck? Peek at [`docs/golden-examples/dependency-auditor.SKILL.md`](../golden-examples/dependency-auditor.SKILL.md) — but only after Genesis has produced its first draft.

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

## 📦 Package locally (5 min) — *see what `apm pack` actually ships*

Before you automate anything, run the pack command yourself and look at the artifact:

```bash
apm pack --target claude --archive
ls build/
# → build/dependency-auditor-0.1.0.tar.gz

tar tzf build/dependency-auditor-0.1.0.tar.gz
```

You'll see the bundle contains:

- `plugin.json` — synthesized from your `apm.yml` (run `apm init --plugin` to commit one explicitly)
- `apm.lock.yaml` — dependency pin manifest
- `skills/dependency-auditor/SKILL.md` — what consumers actually load
- `skills/dependency-auditor/references/`, `evals/` — anything else under your skill folder

That tarball is a Claude Code plugin bundle. Hand it to a teammate, they `apm install` it, and your skill is live in their harness. **No magic** — a manifest and a directory tree.

## 🚀 Automate the release (5 min)

Now that you've seen the local flow, automate it. The release workflow runs the same `apm pack` on every tagged push:

```bash
git add . && git commit -m "feat: dependency-auditor skill v0.1.0"

# If you ran multiple tracks in the same repo, scope the tag:
git tag v0.1.0-dependency-auditor   # or just v0.1.0 if this is your only track
git push origin main --tags
```

> 💡 **Tag collision warning.** Every track guide says `git tag v0.1.0`. If you re-run or run multiple tracks in the same repo, scope per-track (`v0.1.0-dependency-auditor`) or delete the old tag first.

The release workflow validates → packs → publishes a GitHub Release with the tarball attached.

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
