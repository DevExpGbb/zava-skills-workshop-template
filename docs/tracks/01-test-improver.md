# Track 1 · `test-improver`

> **You are not fixing the app. You are authoring a Skill** that finds untested branches in `zava-storefront/lib/cart.ts` (and friends), proposes the missing tests, runs `npm test`, and iterates until green.

⏱️ **90 min**

---

## 📚 Theory anchor

- **Live:** [Architectural Patterns Rosetta Stone — *Verification Loops*](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch18-architectural-patterns-rosetta-stone.html)
- **Live:** [The PROSE Specification](https://danielmeppiel.github.io/agentic-sdlc-handbook/handbook/ch12-the-prose-specification.html)

**Local fallback (3 sentences):** A Skill is a *narrowly-scoped procedure* an agent invokes — not a generalist prompt. The PROSE constraint *Reduced Scope* tells us the test-improver should refuse anything other than "fill missing test coverage in this file"; *Safety Boundaries* keep it from editing source under test. The verification loop pattern (write → run → read failure → refine) is what turns "Copilot drafted some tests" into "the test suite actually passes."

---

## 🔍 Discover the problem

Open these three files:

- [`zava-storefront/lib/cart.ts`](https://github.com/DevExpGbb/zava-storefront/blob/workshop-v1/lib/cart.ts) · `addItem`, `applyDiscount`, `computeTax`, `totalize`
- [`zava-storefront/lib/orders.ts`](https://github.com/DevExpGbb/zava-storefront/blob/workshop-v1/lib/orders.ts) · `createOrder`, `findOrder`, `fulfillmentMessage`
- [`zava-storefront/tests/cart.test.ts`](https://github.com/DevExpGbb/zava-storefront/blob/workshop-v1/tests/cart.test.ts) · note the comment block at the bottom listing **uncovered branches**

Now ask your AI chat assistant (no Skill, no extra context) the naïve prompt:

> "Add tests for `lib/cart.ts`."

Observe:

- It might use Jest syntax — but this app uses **Vitest**.
- It probably misses `applyDiscount` edge cases (`VIP25` threshold, unknown codes).
- Run it twice. Different drafts each time.

That drift is what a Skill removes.

---

## 🧠 Design with Genesis (5 min)

[`genesis`](https://github.com/DevExpGbb/genesis) is pinned in `apm.yml` as a design assistant. Invoke it before writing any `SKILL.md`.

In your IDE (your agent harness — Copilot CLI, Claude Code, Codex, Cursor, OpenCode all work), summon Genesis. **Verify it's loaded first** — type `/genesis` and confirm autocomplete or an acknowledgment from the persona. If nothing happens, run `apm install` again and check `.agents/skills/genesis/` exists.

```
/genesis I want a test-improver skill. It must:
- Target a single source file under zava-storefront/lib/
- Detect functions whose branches/error paths are uncovered by zava-storefront/tests/
- Generate vitest tests for the missing branches (NOT Jest)
- Run `npm test --prefix zava-storefront` after each iteration
- Stop when all branches are green or after 5 iterations
- Emit one final summary comment listing what it added

Draw an ASCII art diagram of the proposed skill architecture. Use this shape:
  User goal → Skill trigger → Inputs → Workflow → Verification → Output artifact
```

Genesis returns a design + ASCII diagram. **Read it before coding.** That doc *is* your spec.

### Reference architecture — what good looks like

Below is the canonical shape Genesis should emit for `test-improver`. Yours may use different node names; what must hold is the **6-band shape** (Goal → Trigger → Inputs → Workflow → Verification → Output).

```
┌─ Goal ─────────────────────────────────────────────────────┐
│  Raise vitest coverage on lib/cart.ts uncovered branches  │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Trigger ──────────────────────────────────────────────────┐
│  "Use the test-improver skill on lib/cart.ts."             │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Inputs ───────────────────────────────────────────────────┐
│  • lib/cart.ts                  (source under test)        │
│  • tests/cart.test.ts           (existing vitest specs)    │
│  • npm test --prefix zava-storefront   (deterministic      │
│                                         oracle, vitest)    │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Workflow (loop, ≤5 iterations) ───────────────────────────┐
│  1. read source + existing tests                           │
│  2. identify an uncovered branch / error path              │
│  3. generate one vitest case for it                        │
│  4. run npm test (the oracle)                              │
│  5. green? stop.  red? read failure, retry step 2.         │
│  6. cap at 5 iterations to prevent runaway loops           │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Verification ─────────────────────────────────────────────┐
│  • npm test green                                          │
│  • new branches covered (vitest --coverage delta)          │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌─ Output artifact ──────────────────────────────────────────┐
│  • Edited tests/cart.test.ts (new vitest cases)            │
│  • One-line summary: branches added + iters consumed       │
└────────────────────────────────────────────────────────────┘
```

> 💾 **Persist Genesis's output.** Don't lose it to chat scrollback. Save it to `.apm/skills/test-improver/DESIGN.md` (after step 2 below creates the folder) so future redesigns start from a real artifact.

---

## 🛠️ Build (25 min) — *generate the skill, don't hand-type it*

> 🚫 **Don't open `.apm/skills/my-skill/SKILL.md` and start typing.** That placeholder exists for `apm install` only — see the note at the top of [the placeholder file](../../.apm/skills/my-skill/SKILL.md). Your real skill is a NEW folder, *generated by your harness from Genesis's design*.

### 1. Ask your harness to generate the skill

In the same chat where Genesis just emitted the design, instruct your harness:

```
Generate the test-improver skill at .apm/skills/test-improver/ following
the Genesis design above. Use SKILL.md frontmatter conventions from
.github/instructions/prose-style.md (installed by apm install from
code-kit): minimal allowed-tools (Read, Grep, Glob, Bash(npm:*), Edit),
narrow "When to use", 3–7 imperative steps in "What this skill does",
explicit outputs, explicit constraints.
```

Your harness writes `.apm/skills/test-improver/SKILL.md`. **Review what it produced** against the Genesis design — node-for-node, constraint-for-constraint.

### 2. Iterate on the *design*, not the implementation

If the generated SKILL.md is wrong, the temptation is to edit it by hand. **Resist.** Instead:

- Tweak the Genesis prompt (e.g. narrow the inputs further, add a hard constraint Genesis missed).
- Re-paste the corrected design.
- Ask your harness: *"Regenerate `.apm/skills/test-improver/SKILL.md` from the updated design above."*

The implementation is a function of the design. Keep that loop tight and the SKILL.md stays maintainable — every future redesign is one Genesis tweak + one regenerate prompt, not a rewrite-from-scratch.

### 3. Sanity-check the generated frontmatter

Whatever your harness produced, verify against the ship-check rules from `code-kit/instructions/prose-style.md`:

- **Frontmatter:** `name: test-improver`, `description`, `license`, `allowed-tools`. `allowed-tools` MUST be minimal — `Read, Grep, Glob, Bash(npm:*), Edit` for this skill, no shell wildcards.
- **When to use this skill:** specific trigger conditions, no fluff. Refuse non-`zava-storefront/lib/*.ts` inputs.
- **Steps:** 3–7 imperative bullets matching the Genesis Workflow band.
- **Outputs:** the artifact list from Genesis's Output band.

If the generated SKILL.md drifts from any of these, fix the *Genesis prompt* (add the missing constraint) and regenerate.

📁 Stuck? Peek at [`docs/golden-examples/test-improver.SKILL.md`](../golden-examples/test-improver.SKILL.md) — but only after your harness has produced its first draft. The golden example shows a known-good shape; comparing it to your generated draft tells you whether your Genesis design was complete enough.

---

## ✅ Validate locally (5 min)

In your IDE, drive the skill:

> "Use the test-improver skill on `zava-storefront/lib/cart.ts`."

Watch the agent:

1. Read `cart.ts`.
2. Compare against `tests/cart.test.ts`.
3. Generate new vitest cases (e.g. for `VIP25`, `WELCOME10`, `computeTax` regions).
4. Run `npm test --prefix zava-storefront`.
5. Iterate.

When the loop converges, run it yourself:

```bash
npm test --prefix zava-storefront
```

You should see new tests covering the cases listed in `cart.test.ts`'s comment block.

---

## 📦 Package + publish (10 min)

```bash
apm run validate          # gh skill publish --dry-run .apm
git add . && git commit -m "feat: test-improver skill v0.1.0"

# If you ran multiple tracks in the same repo, scope the tag:
git tag v0.1.0-test-improver   # or just v0.1.0 if this is your only track
git push origin main --tags
```

> 💡 **Tag collision warning.** Every track guide says `git tag v0.1.0`. If you re-run or run multiple tracks in the same repo, scope per-track (`v0.1.0-test-improver`) or delete the old tag first (`git tag -d v0.1.0 && git push --delete origin v0.1.0`).

The release workflow (`.github/workflows/release.yml`) packs your skill and publishes a GitHub Release with the tarball attached.

---

## 🌐 Automate (15 min)

Workshop scaffold (do these in order — silent failures otherwise):

```bash
# 1 · Create the trigger label first. Without it, the workflow's `on: labeled`
#     stanza never fires and you'll think your Skill is broken.
gh label create run-test-improver --color B0E0FF --description "Run the test-improver skill on this PR"

# 2 · Edit .github/workflows/my-workflow.md. Concrete diff against the scaffold:
#
#       on:
#         pull_request:
#     -     types: [labeled]
#     +     types: [labeled]
#     +     paths: ['zava-storefront/lib/**']
#         workflow_dispatch:
#         roles: [admin, maintainer, write]
#
#       if: |
#     -   (github.event_name == 'pull_request' && github.event.label.name == 'run-my-skill')
#     +   (github.event_name == 'pull_request' && github.event.label.name == 'run-test-improver')
#         || github.event_name == 'workflow_dispatch'

# 3 · Compile (gh aw produces a real .lock.yml from the .md you edited):
gh aw compile      # → .github/workflows/my-workflow.lock.yml  (see https://github.github.com/gh-aw/reference/faq/#what-is-a-workflow-lock-file for why both files exist)
git add .github/workflows/ && git commit -m "ci: compile test-improver workflow"
git push
```

Open a PR touching `zava-storefront/lib/cart.ts`, label it `run-test-improver`, and watch your skill execute on the PR — that's the inner→outer loop transition.

---

## 🌍 Platform payoff (your Skill in someone else's repo)

After §6 of the README, your team-mate can pin your tarball in *their* repo:

```yaml
# their apm.yml
dependencies:
  apm:
    - <your-org>/<your-repo>#v0.1.0-test-improver
```

`apm install` in their repo gets them the same `SKILL.md`, the same `allowed-tools` boundary, the same workflow scaffold. Versioned, reviewable, composable — **that's the package-manager-for-skills claim**.

---

## 🎓 What you learned

- **Genesis = design before code.** You wrote a spec (with an ASCII architecture diagram), then implemented to it.
- **Reduced Scope is real.** Your Skill targets *one file pattern*, not "test the codebase."
- **Local-first, CI second.** Same Skill, same agent, same outcome — whether you run it in your IDE or as a `gh aw` job.
