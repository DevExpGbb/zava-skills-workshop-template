# Track 2 · `docs-generator`

> **You are not fixing the app. You are authoring a Skill** that reads `zava-storefront/lib/*.ts`, detects undocumented exported **functions**, and emits JSDoc + a README usage section — without inventing behavior.

⏱️ **90 min**

---

## 📚 Theory anchor

- **Live:** [The Reference Architecture — *Documentation as a closed loop*](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch04-the-reference-architecture.html)
- **Live:** [The PROSE Specification](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch12-the-prose-specification.html)

**Local fallback (3 sentences):** A docs-generator Skill is a discipline test for the PROSE constraint *Safety Boundaries* — the agent **must not** invent behavior that isn't in the source, even when the source is sparse. *Progressive Disclosure* shapes the output: short JSDoc above each export, then a single "Usage" section with one minimal example each. The win: the same Skill produces the same docs whether a junior or a senior triggers it.

---

## 🔍 Discover the problem

This Skill targets exported **functions** only. Type aliases, interfaces, and zod schemas are out of scope — that scope decision lives in the Skill's `When to use` section and is enforced by the oracle in §5.

Open these:

- [`zava-storefront/lib/cart.ts`](../../zava-storefront/lib/cart.ts) — **5 exported functions** (8 named exports total: 3 are types/schemas, out of scope), zero JSDoc.
- [`zava-storefront/lib/orders.ts`](../../zava-storefront/lib/orders.ts) — **5 exported functions** (8 named exports total), zero JSDoc.
- [`zava-storefront/lib/search.ts`](../../zava-storefront/lib/search.ts) — **2 exported functions** (3 named exports total), zero JSDoc.

Now ask your AI chat assistant (no Skill) the naïve prompt:

> "Document `lib/cart.ts`."

Observe:

- Sometimes it adds JSDoc. Sometimes prose comments. Sometimes both.
- It frequently invents return-shape examples that don't match the actual code.
- It sometimes documents the zod schema as if it were a function.
- Two runs → two voices.

That drift is the failure mode.

---

## 🧠 Design with Genesis (10 min)

```
/genesis I want a docs-generator skill. It must:
- Target a single TypeScript file under zava-storefront/lib/
- For every exported `function` declaration, insert JSDoc above the declaration
  (params, returns, throws — only what the code shows)
- IGNORE type aliases, interfaces, classes, and zod schemas (out of scope)
- Append a "## Usage" section to zava-storefront/README.md (create the section if missing)
  with one minimal code example per documented function
- Refuse to edit any file other than the target file and zava-storefront/README.md
- Never modify function bodies — comments and README only
- Output a one-line summary listing which functions gained docs

Draw an ASCII art diagram of the proposed skill architecture. Use this shape:
  User goal → Skill trigger → Inputs → Workflow → Verification → Output artifact
```

Read Genesis's design + ASCII diagram. That's your spec.

---

## 🛠️ Build (25 min)

Open `.apm/skills/my-skill/SKILL.md`, fill it in. Then rename the **folder** to `docs-generator/`:

```bash
git mv .apm/skills/my-skill .apm/skills/docs-generator
```

> 💡 **Skill discovery binds on the frontmatter `name:` field** (`name: docs-generator`). The folder name is convention only — but keep them aligned to avoid grep confusion later.

**Ship-check rules:**

- `allowed-tools`: `Read, Grep, Glob, Edit` (no shell — this Skill never runs code).
- "When to use": *single TypeScript file under `zava-storefront/lib/` with at least one undocumented exported function*. Refuse otherwise.
- Hard rule in the prompt: **never describe behavior that's not in the source.** If you can't tell from the code, write `@throws` only when you see a `throw` keyword. If a parameter type is `any` or unconstrained, say so — don't speculate.
- Output: edited target file + appended README section + one-line summary.

📁 Stuck? See [`docs/golden-examples/docs-generator.SKILL.md`](../golden-examples/docs-generator.SKILL.md) after your first draft.

---

## ✅ Validate locally — with a real oracle (10 min)

> "Use the docs-generator skill on `zava-storefront/lib/cart.ts`."

Expect:

- `cart.ts` gains JSDoc above `addItem`, `removeItem`, `applyDiscount`, `computeTax`, `totalize` (the 5 functions).
- `cart.ts` zod schemas / types / interfaces are **untouched**.
- `zava-storefront/README.md` gains a `## Usage` section with one example per documented function.
- No edits to `tests/`, `app/`, or other `lib/*.ts` files.

**Now run the three-step oracle.** This is what makes a Skill auditable in a banking-grade workflow:

```bash
# 1 · File scope — only cart.ts and (optionally) zava-storefront/README.md may change.
#     This must print nothing.
git diff --name-only | grep -vE '^(zava-storefront/lib/cart\.ts|zava-storefront/README\.md)$'

# 2 · TypeScript still compiles — comments don't break inference
npx --prefix zava-storefront tsc --noEmit -p zava-storefront/tsconfig.json

# 3 · Tests still pass — function bodies untouched
npm test --prefix zava-storefront

# 4 · Comment-only diff — git diff in cart.ts must show only comment-prefixed lines.
#     If this prints any non-comment line, the Skill broke its own
#     "Safety Boundaries" rule and you reject the run.
git diff zava-storefront/lib/cart.ts | grep -E '^[+-][^+-]' | grep -vE '^[+-]\s*(\*|//|/\*|@)' | head
```

Steps 1 and 4 should print **nothing** (or only blank lines). If step 1 lists `tests/`, `app/`, or another `lib/*.ts`, the Skill went out of scope. If step 4 prints a code change, the Skill modified a function body — fail the run, fix the Skill's prompt, retry.

> 📌 **This is the discipline differentiator.** Tracks 1 and 3 have natural oracles (`npm test`, `npm audit --json`). Track 2's oracle is *you, plus three commands*. Without it, "never invent behavior" is a vibe — a customer auditor will not accept that.

> 🧭 **When do I need an oracle vs. an eval vs. neither?**
> - **Neither** — when the Skill's output is *prose for humans* and "good enough" is judged by the reader (e.g. release-notes-summarizer). Just ship it; let PR review be the loop.
> - **Oracle** — when the Skill's output is *deterministic and check-with-shell-commands* (file scope, type compile, test pass, comment-only diff). Cheap, repeatable, runs every invocation. Use this when "did the Skill stay in its lane?" must be answered in seconds.
> - **Eval** — when the Skill's output is *judgement under variance* (classification, ranking, structured plan). You need a fixture set with expected outcomes (Track 3's `dependency-auditor` and Track 4's `framework-modernizer` ship one). Run on every change to the Skill's prompt or rubric, not every invocation.
> Most banking-grade Skills end up needing both: oracle to gate the run, eval to gate the prompt.

---

## 📦 Package + publish (15 min)

```bash
apm run validate
git add . && git commit -m "feat: docs-generator skill v0.1.0"

# If you ran multiple tracks in the same repo, scope the tag:
git tag v0.1.0-docs-generator   # or just v0.1.0 if this is your only track
git push origin main --tags
```

> 💡 **Tag collision warning.** Every track guide says `git tag v0.1.0`. If you ran Track 1 in the same repo and tagged `v0.1.0` already, this push will fail. Either delete the old tag (`git tag -d v0.1.0 && git push --delete origin v0.1.0`) or scope it: `v0.1.0-docs-generator`.

The release workflow validates → packs → publishes a GitHub Release with the tarball attached.

---

## 🌐 Automate (15 min)

Wire `.github/workflows/my-workflow.md` to run the Skill on PRs touching `zava-storefront/lib/*.ts`. Workshop scaffold:

```bash
# 1 · Create the trigger label (silent failure otherwise — without the label, the
#     workflow doesn't fire and you'll think your Skill is broken):
gh label create run-docs-generator --color B0E0FF --description "Run the docs-generator skill on this PR"

# 2 · Edit .github/workflows/my-workflow.md so the on: stanza watches that label:
#     on:
#       pull_request:
#         types: [labeled]
#     # plus an `if: github.event.label.name == 'run-docs-generator'` guard
#     # in the job.

# 3 · Compile + commit:
gh aw compile      # writes .github/workflows/my-workflow.lock.yml
git add .github/workflows/ && git commit -m "ci: compile docs-generator workflow"
git push
```

Open a PR touching `zava-storefront/lib/cart.ts`, label it `run-docs-generator`, watch the workflow run.

---

## 🌍 The platform payoff — Section 6 (5 min)

Now go back to the [README §6](../../README.md#-section-6--the-platform-claim). The same `docs-generator` skill you just shipped, in a partner repo's `apm.yml`:

```yaml
dependencies:
  apm:
    - <your-org>/<your-repo>#v0.1.0-docs-generator
```

`apm install` in their repo. Same SKILL.md, same `allowed-tools` enforcement, same outputs. **That's the difference between a system prompt and an Agent Skill.**

---

## 🎓 What you learned

- **Safety Boundaries are a prompt-engineering concern.** "Never invent behavior" lives in the Skill, not the model.
- **Progressive Disclosure shapes outputs.** JSDoc + one usage section beats a 500-line tutorial.
- **Documentation becomes a CI step**, not an afterthought.
- **Oracles, even improvised ones, are non-negotiable.** Three-step `tsc + npm test + git diff` proved your Skill stayed in scope. The exact oracle differs per Skill — *that you have one* is the rule.
