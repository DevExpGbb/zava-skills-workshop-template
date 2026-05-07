# Track 4 · `framework-modernizer` — Code Modernization

> Read a fully-built, eval-backed reference skill, then fork the pattern for *your* migration. Express 4 → 5 today; React 17 → 18, Next 13 → 14, Spring Boot 2 → 3 tomorrow.

⏱️ **45 min** · 🎯 **Cross-cutting:** spans CODE, REVIEW, RELEASE — not a single SDLC phase.

---

## 🔍 Why this track is different

The first three tracks had you build skills from scratch. This one starts from a finished one.

Major framework upgrades are 80% mechanical (catalog the breaking changes, find them in your codebase, autofix the trivial ones) and 20% judgment (the breaking changes that need human eyes). LLMs are notorious for hallucinating "breaking changes" from training data. The fix is not a smarter model — it's **anchoring the skill to a source-of-truth catalog and proving it works with an eval**.

We built `framework-modernizer` ([`.apm/skills/framework-modernizer/`](../../.apm/skills/framework-modernizer/)) as the worked example. You'll read it, run it, fork it.

---

## 🧠 Read the design first (10 min)

Open [`.apm/skills/framework-modernizer/references/DESIGN.md`](../../.apm/skills/framework-modernizer/references/DESIGN.md). It's the **Genesis 8-step handoff packet** persisted as a doc. Skim:

- **Step 1 — intent.** Single capability, single framework pair. *Not* a "migrate any framework" mega-skill.
- **Step 2 — components.** Why **PIPELINE** beat PANEL here (no independent lenses; classification is mechanical).
- **Step 5 — PROSE compliance.** Catalog = engineering context. Rubric = rules. Skill = the orchestration.
- **Step 7 — the handoff packet.** What every fork of this pattern needs.

Then open [`.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md`](../../.apm/skills/framework-modernizer/references/express-4-to-5-breaking-changes.md). **Every entry cites a section anchor on `expressjs.com`.** That's Rule #1: no invented breaking changes.

---

## 🏃 Run it (5 min)

The skill ships with a fixture mini-app and a deterministic eval:

```bash
node .apm/skills/framework-modernizer/evals/run.js
```

You should see:

```
✅ framework-modernizer eval PASSED (8 findings match expected)
```

Now invoke the skill on the same fixture:

> "Use the framework-modernizer skill on `.apm/skills/framework-modernizer/evals/fixtures/express4-app/`"

You'll get a `MIGRATION-PLAN.md` with three phases: autofixed (already done), manual (with code pointers), validation checklist. Read the plan — note how the SAFE/AUTOFIX/MANUAL classifications come from [`classifier-rubric.md`](../../.apm/skills/framework-modernizer/references/classifier-rubric.md), not the model's intuition.

---

## 🍴 Fork the pattern (20 min)

Pick *your* migration. The file-by-file substitution is in `DESIGN.md` "Forking this pattern" — but the shape is:

1. **Build the catalog.** From the official upstream migration guide, extract every breaking change as `BC-NNN` with: ID, classification (SAFE/AUTOFIX/MANUAL), source citation, detect regex, fix snippet. Cite anchors. *No training-data invention.*
2. **Build a fixture.** A minimal app that triggers a representative subset of catalog entries. Annotate each line `// EXPECT-NNN`.
3. **Build expected findings.** `BC-ID<TAB>file<TAB>line` rows the runner must reproduce.
4. **Wire the runner.** Copy `evals/run.js` and swap the `PATTERNS` array.
5. **Run the eval.** Iterate until green.

Suggested fork targets:

| Migration | Why it's a good fit |
|---|---|
| Next.js 13 → 14 | App Router migration; well-documented codemods; lots of breaking changes |
| React 17 → 18 | Strict mode, `createRoot`, automatic batching — high mechanical surface |
| Spring Boot 2 → 3 | Jakarta EE namespace flip; codified migration guide |
| .NET 6 → 8 | `Program.cs` minimal hosting; explicit changelog per release |

---

## ✅ Validate (5 min)

Your eval is the contract. If it passes, the catalog regexes are accurate against the fixture. If you change the catalog, run the eval — drift breaks CI.

For the real demo, target [`zava-platform`](https://github.com/DevExpGbb/zava-platform) (or your own target repo) and have the skill open a PR with the autofixed phase committed and `MIGRATION-PLAN.md` attached.

---

## 🌐 Automate (5 min)

Wire the skill to a `gh aw` workflow:

- **Trigger:** label `modernize:express-5` on an issue, or a scheduled monthly run on a target repo.
- **Action:** clone target → run skill → open PR with autofixed changes + plan.

The workflow lives in `.github/workflows/` after you `gh aw compile`.

---

## 🎓 What you learned

- **Source-grounded skills beat clever prompts.** A 12-row catalog with cited anchors beats "use your knowledge of Express 5" every time.
- **Evals make skills refactorable.** Without an eval, every catalog edit is a leap of faith. With one, you change a regex and watch CI.
- **Pipeline > Panel for mechanical work.** Don't reach for fan-out/synthesizer when classification is deterministic.
- **The Genesis handoff packet is portable.** `DESIGN.md` makes this skill forkable. Without it, you're starting from zero.
