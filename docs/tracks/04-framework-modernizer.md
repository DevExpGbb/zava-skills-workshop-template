# Track 4 · `framework-modernizer` — Reference deep-dive + live design (appendix)

> **You are not shipping a Skill in this track. You are *designing* one** — by running Genesis live on your own fork brief, diffing its output against our reference, and authoring exactly one new catalog entry. The full fork (catalog + rubric + fixture + two test layers for a fresh framework pair) is a multi-hour exercise; we keep the workshop-time deliverable honest while making the design experience hands-on.

⏱️ **~35 min** (depth-flexible — Mode A keeps it tight; Modes B/C may run longer if you choose to go deep on your own migration)

> 📦 **Deliverable check:** Tracks 1–3 ship a tagged `v0.1.0` skill on your repo. **Track 4 does not.** This track teaches the *design discipline* (Genesis 8-step) on your own fork brief so you can ship a real modernizer at home.

---

## 📚 Theory anchor

- **Live:** [Architectural Patterns Rosetta Stone — *Pipeline / Catalog patterns*](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html)
- **Live:** [The Reference Architecture](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch04-the-reference-architecture.html)

**Local fallback (3 sentences):** Major framework upgrades are 80% mechanical (catalog the breaking changes, find them, autofix the trivial ones) and 20% judgment. LLMs hallucinate "breaking changes" from training data — the fix is not a smarter model but **a source-of-truth catalog with citations + a regression test that proves the regexes still match + behavior evals that prove the skill outperforms `without_skill`**. The Catalog → Rubric → Skill → (regression + behavior evals) shape generalizes: pick *any* X→Y framework pair and the same artifacts ship a defensible modernizer.

---

## 🔍 Why this track is different

We built [`framework-modernizer`](../../.apm/skills/framework-modernizer/) as a worked example for Express 4→5. You'll **skim** its design, **run its tests**, then — and this is the heart of the track — **run Genesis live on your own fork brief**, compare the design it returns to ours, and author **one new BC-NNN catalog entry** for your X→Y pair. The full fork (catalog + rubric + fixture + two test layers for a fresh framework pair) is a multi-hour exercise; the workshop-time deliverable stays honest while the **design experience is hands-on**.

Running Genesis is cheap — it's a pure in-agent design session, no compilation, no CI, no PAT. The pedagogical point is to feel that for yourself: hand it a vague brief, watch the 8-step process derive a defensible architecture, then read it against ours and notice what carries over and what doesn't.

> 📦 **Productization heads-up.** The modernizer pattern you're reading here has graduated to a productized accelerator in [`DevExpGbb/zava-agent-config`](https://github.com/DevExpGbb/zava-agent-config) under `plugins/accelerators/modernize-kit/` (v6.1.0+), shipping with both `framework-modernizer` (Express 4→5, the read-along reference here) and `nextjs-modernizer` (Next 14→15, verified against `zava-storefront/`). Once your fork is solid, the home for it is alongside those — not in a one-off team repo.

---

## 🧠 1 · Skim the reference design (5 min)

Open [`.apm/skills/framework-modernizer/references/DESIGN.md`](../../.apm/skills/framework-modernizer/references/DESIGN.md). It's the **Genesis 8-step handoff packet** persisted as a doc. Skim — don't deep-read — to set expectations for what shape your own Genesis run will produce:

- **Step 1 — intent.** Single capability, single framework pair. *Not* a "migrate any framework" mega-skill.
- **Step 2 — components.** Why **PIPELINE** beat PANEL here (no independent lenses; classification is mechanical).
- **Step 5 — the four artifacts.** Catalog (cited breaking changes) → Rubric (SAFE/AUTOFIX/MANUAL classifier) → Skill (orchestration) → Eval (regex regression test).
- **Step 7 — the handoff packet.** What every fork of this pattern needs.

Then glance at [`.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md`](../../.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md). **Every entry cites a section anchor on `expressjs.com`.** That's Rule #1: no invented breaking changes.

---

## 🏃 2 · Run the tests (5 min)

The skill ships **two test layers** — both scaffolded by Genesis when this skill was designed:

| Layer | What it tests | Run it |
|---|---|---|
| **Catalog regression** ([`evals/run.js`](../../.apm/skills/framework-modernizer/evals/run.js)) | The deterministic substrate — locks the catalog regexes against the fixture so a bad regex edit fails CI. No LLM. | `node .apm/skills/framework-modernizer/evals/run.js` |
| **Behavior evals** ([`evals/evals.json`](../../.apm/skills/framework-modernizer/evals/evals.json) + [`triggers.json`](../../.apm/skills/framework-modernizer/evals/triggers.json)) | The skill's actual behavior — each case runs twice (with_skill / without_skill) to make the value delta measurable. Per [agentskills.io spec](https://agentskills.io/skill-creation/evaluating-skills). | Manual / harness-driven — see [`evals/README.md`](../../.apm/skills/framework-modernizer/evals/README.md) |

Run the catalog regression now (fast, hermetic):

```bash
node .apm/skills/framework-modernizer/evals/run.js
```

You should see:

```
✅ framework-modernizer catalog regression PASSED (8 findings match expected)
```

Now invoke the skill on the same fixture from your harness — this is one of the prompts in `evals.json` (case `fm-c1-explicit-migration`):

> "Migrate this Express 4 app to Express 5. Audit for breaking changes, apply safe fixes in place, and write a migration plan I can hand to my team. Fixture: `.apm/skills/framework-modernizer/evals/fixtures/express4-app/`."

You'll get a `MIGRATION-PLAN.md` with three phases: autofixed (already done), manual (with code pointers), validation checklist. Read the plan — note how the SAFE/AUTOFIX/MANUAL classifications come from [`classifier-rubric.md`](../../.apm/skills/framework-modernizer/references/classifier-rubric.md), not the model's intuition.

> 💡 **Why two layers?** The catalog regression test catches "did someone break the regex?" in CI. The behavior evals catch "does the skill *actually help* a real LLM produce a better migration plan than no skill at all?" — and that's the question agentskills.io says you must be able to answer for any skill you ship.

---

## 🪄 3 · Run Genesis live on YOUR fork brief (10 min) — the centerpiece

Pick your fork target. Three escalating modes — pick what fits your morning:

| Mode | Pick when | Brief shape |
|---|---|---|
| **A · Suggested migration** | You want the cleanest comparison against our reference | One of the suggested pairs in the table below |
| **B · Your team's real migration** | You came with a migration on your plate at work | Whatever X→Y is actually on your roadmap |
| **C · Your own source code** | You brought a repo and want Genesis to scope a modernizer against *its* actual surface | Point Genesis at the repo path + the migration you want |

Suggested migrations (Mode A):

| Migration | Why it's a good fit |
|---|---|
| Next.js 14 → 15 | App Router stable surface; codified migration guide; *applies to `zava-storefront/`* — natural take-home |
| React 17 → 18 | Strict mode, `createRoot`, automatic batching — high mechanical surface |
| Spring Boot 2 → 3 | Jakarta EE namespace flip; codified migration guide |
| .NET 6 → 8 | `Program.cs` minimal hosting; explicit changelog per release |

Now run Genesis cold. Adapt the brief to your mode:

```
/genesis I'm designing a framework-modernizer skill for <X → Y, e.g. Next 14 → 15>.

Context (Mode C only): the target codebase is at <path>. The modernizer
should be scoped to that repo's actual surface area, not a generic case.

Reference: <upstream migration guide URL with anchor>.

Run the full 8-step process. I want to see:
- Step 1 intent + dispatch description
- Step 2 component diagram (mermaid)
- Step 3 thread / sequence diagram
- Step 3.5 composition decisions
- Step 4 SoC pass
- Step 5 compliance check
- Step 6 handoff packet (persist it)
- The proposed evals plan (catalog regression shape + behavior evals shape)

Also produce: one example BC-NNN catalog entry for the most prominent
breaking change in the migration, including the regex and a one-line
fixture snippet I should grep against.
```

Let it run end-to-end. You'll get a fresh handoff packet that **may or may not** look exactly like our Express 4→5 design — that's the point of the next step.

---

## 🔬 4 · Diff Genesis's output against the reference design (3 min)

Open Genesis's fresh packet next to [`references/DESIGN.md`](../../.apm/skills/framework-modernizer/references/DESIGN.md). Scan for two kinds of overlap:

**Patterns that should carry across most migrations** (read these against the [Architectural Patterns Rosetta Stone chapter](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html) — the live reference for what these names mean):

- **A2 PIPELINE** as the architectural pattern — most framework migrations decompose into discover → classify → dispatch with no independent lenses.
- **B8 ATTENTION ANCHOR** — every finding cites a catalog entry; the catalog is the only license to emit a finding.
- **S7 DETERMINISTIC TOOL BRIDGE** — grep / AST tool / lockfile parser carries the regex matching, not the LLM.
- **B4 PLAN MEMENTO** — the persisted migration plan outlives the chat.
- **Two test layers** — deterministic catalog regression + behavior evals with the `with_skill` / `without_skill` shape.

**Where Genesis may legitimately diverge** (variant designs are not wrong — they reflect the target's reality):

- **The pattern itself may differ.** If your migration has independent lenses (e.g. type-system migration + dependency upgrade + config flip all needing different expertise), Genesis may propose **A1 PANEL** instead of PIPELINE. That's a signal about your migration's shape, not a Genesis bug.
- **Composition decisions** (step 3.5) — your fork may externalize the catalog as its own module if you have multiple Java migrations sharing one BC-NNN format; ours inlines it.
- **The classifier rubric tie-breaker** — risk profile differs by ecosystem. Java's namespace flips skew toward AUTOFIX; .NET hosting-model changes skew toward MANUAL.
- **Tool selection at S7** — JavaScript skills lean on grep; Java/.NET skills may need a real AST tool (`jdt`, Roslyn) because regex on type-system changes is brittle.
- **Evals shape** — the behavior eval prompts will name your framework's idioms; the catalog regression's `expected` table will have a different cardinality.

If Genesis returned something *structurally* very different from our reference — for example, no catalog at all, or no regression test layer — that's worth a question to your facilitator. Either your migration genuinely needs a different shape (interesting!) or the brief under-specified something Genesis filled in with a weaker default.

> 📚 **Going deeper.** The "why these patterns" answers are in the [Architectural Patterns Rosetta Stone chapter](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html) and [The Reference Architecture](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch04-the-reference-architecture.html). Read them during the workshop if step 4 left you with open questions, or afterwards as you build your full fork.

---

## ✍️ 5 · Author one new catalog entry (10 min) — the actual deliverable

You have Genesis's design for your fork. Now ship the smallest concrete piece of it: **one BC-NNN catalog entry**, one fixture line, and a regex you've verified by hand. That's the workshop-time deliverable — proof you can execute against your own design, not just read someone else's.

Use the catalog entry Genesis already proposed in step 3 as your starting point, or pick a different breaking change from your migration guide if Genesis's pick wasn't the most illustrative one for your audience.

### Reference shape — the express-4-to-5 closed loop

This is the closed-loop architecture our reference skill ships. Compare it to Genesis's diagram for your fork: the nodes will rename, some edges may move, but the **closed loop across catalog / rubric / orchestrator / regression test / behavior evals** is the durable shape — remove any one artifact and the others lose their grip on reality. (Rendered in Mermaid; Genesis emits ASCII into your chat.)

```mermaid
flowchart TD
  CAT[(ASSET CATALOG<br/>express-4-to-5-breaking-changes.md<br/>BC-001 ...<br/>BC-002 ...<br/>BC-NNN ...)]
  RUB[(ASSET RUBRIC<br/>SAFE / AUTOFIX / MANUAL<br/>+ tie-breaker)]
  FIX[(ASSET FIXTURE<br/>mini Express 4 app<br/>one hit per BC)]

  ORCH[SKILL ORCHESTRATOR A2 PIPELINE<br/>discover - grep BC.regex - classify - dispatch]

  AUTO[AUTOFIX bin<br/>edit in place]
  MAN[MANUAL bin<br/>insert TODO + plan row]
  SAFE[SAFE bin<br/>checklist row only]

  SRC[(source files mutated)]
  PLAN[(MIGRATION-PLAN.md<br/>OUTPUT B4 PLAN MEMENTO)]

  REGRESSION[CATALOG REGRESSION TEST<br/>for BC in CATALOG: hits = grep regex on FIXTURE<br/>assert hits == expected else FAIL CI<br/>deterministic, no LLM]

  BEHAVIOR_EVALS[BEHAVIOR EVALS<br/>evals.json: with_skill vs without_skill<br/>triggers.json: dispatch description<br/>per agentskills.io spec]

  TODAY[TODAY'S DELIVERABLE<br/>one BC-NNN row<br/>+ one fixture line]

  CAT -- "regex + class" --> ORCH
  RUB -- "classify rule" --> ORCH
  FIX -- "scan target" --> ORCH
  ORCH --> AUTO
  ORCH --> MAN
  ORCH --> SAFE
  AUTO --> SRC
  MAN --> PLAN
  SAFE --> PLAN

  CAT == "regex source" ==> REGRESSION
  FIX == "regression target" ==> REGRESSION
  REGRESSION -. "FAIL CI on regex drift" .-> CAT

  ORCH == "the skill under test" ==> BEHAVIOR_EVALS
  FIX == "shared fixture" ==> BEHAVIOR_EVALS
  BEHAVIOR_EVALS -. "value delta vs baseline" .-> ORCH

  TODAY -. "plugs into" .-> CAT
  TODAY -. "plugs into" .-> FIX

  classDef artifact fill:#eef,stroke:#447;
  classDef orchestrator fill:#ffd,stroke:#a80;
  classDef regression fill:#fdd,stroke:#a44;
  classDef behavior fill:#dfd,stroke:#272;
  classDef output fill:#dfd,stroke:#272;
  classDef todays fill:#fd8,stroke:#a40,stroke-width:3px;
  class CAT,RUB,FIX artifact;
  class ORCH orchestrator;
  class REGRESSION regression;
  class BEHAVIOR_EVALS behavior;
  class PLAN,SRC output;
  class TODAY todays;
```

**Why this shape (and what it reuses from the Genesis pattern catalogue):**

- **A2 PIPELINE wrapped by two test layers** — *not* STAFFED PLAN; there are no per-task agents. Single-pass, deterministic discover→classify→dispatch. If your Genesis run returned PANEL or another pattern, that's a signal your migration has independent lenses ours doesn't have.
- **B4 PLAN MEMENTO** — `MIGRATION-PLAN.md` is the persisted artifact. The skill writes the plan; the team executes it. Plan outlives the chat.
- **B8 ATTENTION ANCHOR** — every finding must cite a `BC-NNN`. The catalog row is the *only* license to emit a finding. No row → no finding. Hallucinated migrations cannot enter the pipeline.
- **S7 DETERMINISTIC TOOL BRIDGE** — grep and the catalog regression test are the deterministic substrate. The LLM never adjudicates a regex match. (Yours may swap grep for an AST tool — same role, different bridge.)
- **EXPLICIT HIERARCHY (PROSE-E)** — the 3-bin classifier is *closed*. Inventing a 4th class means the catalog is wrong, not the rubric.
- **Two test layers, two failure modes caught.** Catalog regression catches "did someone break the regex?" (deterministic, CI-friendly). Behavior evals catch "does the skill *actually outperform no-skill* on a real prompt?" (inference-based, per agentskills.io). Skipping either leaves a class of regression undetected.
- **Today's deliverable** is the orange node: one BC-NNN row + one fixture line. The orchestrator, rubric, and both test layers are reused — you're feeding them, not rebuilding them.

**Fork failure modes Genesis tends to surface:** (1) catalog rows without source-anchor URLs → hallucinated migrations; (2) new BC without matching fixture line → regex rots silently in the regression test; (3) regression assertion `hits >= 1` instead of `== expected` → false positives slip; (4) classifier drift (a 4th bin invented inline); (5) AUTOFIX used where rewrite needs cross-file awareness — bias-to-safety lives in the rubric tie-breaker; (6) shipping with no behavior evals → no evidence the skill outperforms `without_skill` baseline → may be cargo-culted prompt scaffolding adding nothing.

> 🛠️ **Today's deliverable is one BC-NNN entry**, not the full pipeline. The diagram above is the *reference shape* — it tells you what slot your one entry plugs into and why the catalog citation discipline matters (every node downstream of "Catalog" is a function of catalog quality).

**Schema for one entry** (mirror exactly what `express-4-to-5-breaking-changes.md` uses):

```markdown
### BC-NNN — <short title>

- **Classification:** SAFE | AUTOFIX | MANUAL
- **Source:** <official guide URL with anchor>
- **Detect:** `<javascript regex>`
- **Example match:** `<one-line fixture snippet>`
- **Fix (if AUTOFIX):** `<replacement snippet>`
- **Notes:** <one-line rationale, no marketing>
```

**Workshop-time check:** create a fixture file with your example match + one decoy line (no match), run the regex with `grep -nE '<your-regex>' fixture.txt`, confirm it matches the line you expect and *not* the decoy. **That's your catalog regression discipline in miniature.** When you've finished the full fork, ask Genesis to scaffold the behavior evals (`evals.json` + `triggers.json`) — that's the second layer the workshop's framework-modernizer ships.

---

## 📦 Take-home: the full fork

You won't finish the fork in this session. The path home:

1. **Build the catalog.** From the official upstream migration guide, extract every breaking change as `BC-NNN` with: ID, classification, source citation, detect regex, fix snippet. Cite anchors.
2. **Build a fixture.** A minimal app that triggers a representative subset of catalog entries. Annotate each line `// EXPECT-NNN`.
3. **Build expected findings** for the regression test. `BC-ID<TAB>file<TAB>line` rows the runner must reproduce.
4. **Wire the regression test.** Copy `evals/run.js` and swap the `PATTERNS` array.
5. **Run the regression test.** Iterate until green.
6. **Scaffold the behavior evals.** Ask Genesis: *"Use the genesis skill to scaffold evals for this skill per agentskills.io spec."* It will produce `evals/evals.json` (3 content evals with `with_skill` / `without_skill` shape) + `evals/triggers.json` (~20 dispatch trigger queries split 60/40 train/val). Then run them per [`evals/README.md`](../../.apm/skills/framework-modernizer/evals/README.md) and ship only when `with_skill` shows measurable delta over `without_skill`.

The file-by-file substitution is in `DESIGN.md` "Forking this pattern."

For an internal stretch: target your own platform repo (e.g. [`zava-platform`](https://github.com/DevExpGbb/zava-platform) as a public reference) — fork the modernizer for **Next 14 → 15** and run it against this template's own `zava-storefront/`. Have the skill open a PR with the autofixed phase committed and `MIGRATION-PLAN.md` attached.

---

## 🎓 What you learned

- **Source-grounded skills beat clever prompts.** A 12-row catalog with cited anchors beats "use your knowledge of Express 5" every time.
- **Two test layers, two failure classes.** Catalog regression tests catch deterministic substrate drift in CI. Behavior evals (per [agentskills.io](https://agentskills.io/skill-creation/evaluating-skills)) catch "does the skill actually outperform `without_skill`?" Without both, you're guessing.
- **Pipeline > Panel for mechanical work** — *most of the time*. Don't reach for fan-out/synthesizer when classification is deterministic. But Genesis may legitimately propose a different pattern if your migration's surface area genuinely has independent lenses — trust the design dialogue, not the template.
- **Genesis is cheap enough to use as a thinking tool.** Cold-prompting it on a fork brief and reading the 8-step output is faster than reverse-engineering the shape from someone else's `DESIGN.md`. Use it on every non-trivial skill you ship, not just the ones you're stuck on.
- **The handoff packet is portable.** A persisted `DESIGN.md` is what makes a skill forkable. Without it, the next fork starts from zero.
- **One entry teaches the discipline.** The full catalog is engineering effort; the *shape* is what generalizes — and you saw it generalize when you diffed Genesis's output for your migration against ours.

