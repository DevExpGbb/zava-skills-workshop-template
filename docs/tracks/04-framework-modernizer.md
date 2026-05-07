# Track 4 · `framework-modernizer` — Reference deep-dive (appendix)

> **You are not building a Skill in this track. You are *reading* one** — and authoring exactly one new catalog entry for *your* framework migration. The full fork (catalog + rubric + fixture + eval for a fresh framework pair) is a multi-hour exercise; we keep the workshop-time deliverable honest.

⏱️ **30 min** (not 45 — see budget below)

> 📦 **Deliverable check:** Tracks 1–3 ship a tagged `v0.1.0` skill on your repo. **Track 4 does not.** This track teaches the *pattern* so you can ship a real fork at home.

---

## 📚 Theory anchor

- **Live:** [Architectural Patterns Rosetta Stone — *Pipeline / Catalog patterns*](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html)
- **Live:** [The Reference Architecture](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch04-the-reference-architecture.html)

**Local fallback (3 sentences):** Major framework upgrades are 80% mechanical (catalog the breaking changes, find them, autofix the trivial ones) and 20% judgment. LLMs hallucinate "breaking changes" from training data — the fix is not a smarter model but **a source-of-truth catalog with citations + an eval that proves the regexes still match**. The Catalog → Rubric → Skill → Eval shape generalizes: pick *any* X→Y framework pair and the same four artifacts ship a defensible modernizer.

---

## 🔍 Why this track is different

We built [`framework-modernizer`](../../.apm/skills/framework-modernizer/) as the worked example. You'll **read** it, **run** its eval, and **author one new BC-NNN catalog entry** for your own framework pair — proving you understand the shape without pretending you can ship a fork in 30 min.

There is no `/genesis` step at the start of this track — the design is already on disk under `references/DESIGN.md`. You'll rerun `/genesis` *only* when you fork at home.

> 📦 **Productization heads-up.** The modernizer pattern you're reading here has graduated to a productized accelerator in [`DevExpGbb/zava-agent-config`](https://github.com/DevExpGbb/zava-agent-config) under `plugins/accelerators/modernize-kit/` (v6.1.0+), shipping with both `framework-modernizer` (Express 4→5, the read-along reference here) and `nextjs-modernizer` (Next 14→15, verified against `zava-storefront/`). Once your fork is solid, the home for it is alongside those — not in a one-off team repo.

---

## 🧠 1 · Read the design (10 min)

Open [`.apm/skills/framework-modernizer/references/DESIGN.md`](../../.apm/skills/framework-modernizer/references/DESIGN.md). It's the **Genesis 8-step handoff packet** persisted as a doc. Skim:

- **Step 1 — intent.** Single capability, single framework pair. *Not* a "migrate any framework" mega-skill.
- **Step 2 — components.** Why **PIPELINE** beat PANEL here (no independent lenses; classification is mechanical).
- **Step 5 — the four artifacts.** Catalog (cited breaking changes) → Rubric (SAFE/AUTOFIX/MANUAL classifier) → Skill (orchestration) → Eval (regex regression test).
- **Step 7 — the handoff packet.** What every fork of this pattern needs.

Then open [`.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md`](../../.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md). **Every entry cites a section anchor on `expressjs.com`.** That's Rule #1: no invented breaking changes.

---

## 🏃 2 · Run the eval (5 min)

The skill ships with a fixture mini-app and a deterministic eval:

```bash
node .apm/skills/framework-modernizer/evals/run.js
```

You should see:

```
✅ framework-modernizer eval PASSED (8 findings match expected)
```

Now invoke the skill on the same fixture from your harness:

> "Use the framework-modernizer skill on `.apm/skills/framework-modernizer/evals/fixtures/express4-app/`."

You'll get a `MIGRATION-PLAN.md` with three phases: autofixed (already done), manual (with code pointers), validation checklist. Read the plan — note how the SAFE/AUTOFIX/MANUAL classifications come from [`classifier-rubric.md`](../../.apm/skills/framework-modernizer/references/classifier-rubric.md), not the model's intuition.

---

## ✍️ 3 · Author one new catalog entry (15 min) — the actual deliverable

Pick *your* migration. Pick **one** breaking change from its official upstream guide. You'll author **one BC-NNN entry**, build a **one-line fixture**, and prove the regex matches — that's the workshop-time deliverable.

Use Genesis only if it helps (and yes, ask for the ASCII diagram of your fork's eventual shape):

```
/genesis I'm forking the framework-modernizer skill for <X→Y, e.g. Next 14→15>.
For now I only need to scope ONE breaking-change entry: <name the change>.
Reference: <upstream guide URL with anchor>.

Produce: a single BC-NNN entry following the existing express-4-to-5 catalog
schema, plus the one-line fixture I should grep against, plus the regex.

Draw an ASCII art diagram of what the *eventual* full fork would look like.
Use this shape:
  User goal → Skill trigger → Inputs → Workflow → Verification → Output artifact
```

### Reference architecture — what good looks like (the *fork* shape)

Below is the canonical shape Genesis should emit when you scope your eventual full fork (using Next 14→15 as the example pair). Yours will use a different X→Y, but the **6-band shape** is what generalizes — and the four-artifact triangle (Catalog / Rubric / Fixture / Eval) inside the Workflow band is what makes a modernizer *defensible* rather than vibes-based.

```
┌─ Goal ─────────────────────────────────────────────────────┐
│  Migrate a Next 14 codebase to Next 15 with a defensible  │
│  plan: cited breaking changes, classified, regression-     │
│  guarded                                                   │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Trigger ──────────────────────────────────────────────────┐
│  "Use the nextjs-modernizer skill on <repo-path>."         │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Inputs ───────────────────────────────────────────────────┐
│  • Target codebase (read-only, Grep + Edit for autofixes)  │
│  • next-14-to-15-breaking-changes.md (CATALOG, cited)      │
│  • classifier-rubric.md (SAFE / AUTOFIX / MANUAL)          │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Workflow (PIPELINE — the four-artifact loop) ─────────────┐
│                                                            │
│   ┌─ Catalog ─┐    ┌─ Rubric ─┐    ┌─ Skill ──┐    ┌─ Eval ─┐
│   │ BC-001..N │ →  │ classify │ →  │ orchestr.│ →  │ regex  │
│   │ cited     │    │ findings │    │ migration│    │ regress│
│   │ regexes   │    │ (3 bins) │    │ plan     │    │ guard  │
│   └───────────┘    └──────────┘    └──────────┘    └────────┘
│                                                            │
│  1. grep target with each BC catalog entry's regex         │
│  2. classify hits via rubric (SAFE/AUTOFIX/MANUAL)         │
│  3. autofix the AUTOFIX bin (deterministic substitution)   │
│  4. write MIGRATION-PLAN.md with the MANUAL bin            │
│  5. NEVER hallucinate a breaking change — catalog only     │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Verification ─────────────────────────────────────────────┐
│  • node evals/run.js (regex regression: ≥N expected hits)  │
│  • Fixture mini-app exercises every catalog entry          │
│  • Existing tests still pass after AUTOFIX phase           │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Output artifact ──────────────────────────────────────────┐
│  • MIGRATION-PLAN.md (3 phases: autofixed / manual /       │
│    validation checklist)                                   │
│  • PR with autofixed phase committed                       │
└────────────────────────────────────────────────────────────┘
```

> 🛠️ **Today's deliverable is one BC-NNN entry**, not the full pipeline. The diagram above is the *target shape* — it tells you what slot your one entry plugs into and why the catalog citation discipline matters (every node downstream of "Catalog" is a function of catalog quality).

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

**Workshop-time check:** create a fixture file with your example match + one decoy line (no match), run the regex with `grep -nE '<your-regex>' fixture.txt`, confirm it matches the line you expect and *not* the decoy. **That's your eval discipline in miniature.**

Suggested fork targets:

| Migration | Why it's a good fit |
|---|---|
| Next.js 14 → 15 | App Router stable surface; codified migration guide; *applies to `zava-storefront/`* — natural take-home |
| React 17 → 18 | Strict mode, `createRoot`, automatic batching — high mechanical surface |
| Spring Boot 2 → 3 | Jakarta EE namespace flip; codified migration guide |
| .NET 6 → 8 | `Program.cs` minimal hosting; explicit changelog per release |

---

## 📦 Take-home: the full fork

You won't finish the fork in this session. The path home:

1. **Build the catalog.** From the official upstream migration guide, extract every breaking change as `BC-NNN` with: ID, classification, source citation, detect regex, fix snippet. Cite anchors.
2. **Build a fixture.** A minimal app that triggers a representative subset of catalog entries. Annotate each line `// EXPECT-NNN`.
3. **Build expected findings.** `BC-ID<TAB>file<TAB>line` rows the runner must reproduce.
4. **Wire the runner.** Copy `evals/run.js` and swap the `PATTERNS` array.
5. **Run the eval.** Iterate until green.

The file-by-file substitution is in `DESIGN.md` "Forking this pattern."

For an internal stretch: target your own platform repo (e.g. [`zava-platform`](https://github.com/DevExpGbb/zava-platform) as a public reference) — fork the modernizer for **Next 14 → 15** and run it against this template's own `zava-storefront/`. Have the skill open a PR with the autofixed phase committed and `MIGRATION-PLAN.md` attached.

---

## 🎓 What you learned

- **Source-grounded skills beat clever prompts.** A 12-row catalog with cited anchors beats "use your knowledge of Express 5" every time.
- **Evals make skills refactorable.** Without an eval, every catalog edit is a leap of faith. With one, you change a regex and watch CI.
- **Pipeline > Panel for mechanical work.** Don't reach for fan-out/synthesizer when classification is deterministic.
- **The Genesis handoff packet is portable.** `DESIGN.md` makes this skill forkable. Without it, you're starting from zero.
- **One entry teaches the discipline.** The full catalog is engineering effort; the *shape* is what generalizes.
