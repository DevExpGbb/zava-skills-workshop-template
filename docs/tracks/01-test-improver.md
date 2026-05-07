# Track 1 · `test-improver`

> Build a skill that finds untested branches in `sample-app/src/calculator.js`, generates the missing tests, runs `npm test`, and iterates until green.

⏱️ **45 min** · 🎯 **PROSE focus:** **S**kills + **R**eliability via test loops

---

## 🔍 Discover the problem

Open [`sample-app/src/calculator.js`](../../sample-app/src/calculator.js) and [`sample-app/tests/calculator.test.js`](../../sample-app/tests/calculator.test.js).

Notice:

- `calculator.js` exports six functions (`add`, `subtract`, `multiply`, `divide`, `power`, `factorial`)
- `calculator.test.js` tests **one branch of one function**
- `divide` throws on zero · `power` recurses on negative exponents · `factorial` throws on negatives — none of these are tested

Now ask Copilot Chat (no skill, no context) the naïve prompt:

> "Add tests for calculator.js"

Observe:

- It probably uses Jest syntax (we use `node:test`)
- It probably misses the `Error` paths
- Different developers get different results

**This is the drift PROSE skills exist to eliminate.** Let's design a skill that doesn't drift.

---

## 🧠 Design with Genesis (5 min)

Genesis is pinned in `apm.yml` as a design assistant — invoke it instead of writing `SKILL.md` from scratch.

In your IDE (Copilot CLI / Claude Code / Codex / Cursor), summon it:

```
/genesis I want a test-improver skill. It must:
- Read source files under sample-app/src/
- Detect functions whose branches are not covered by tests/
- Generate node:test cases (NOT Jest) for the missing branches
- Run `npm test` after each iteration
- Stop when all branches are green or after 5 iterations
- Always emit one final summary comment listing what it added
```

Genesis will return a layout proposal — sections, contracts, acceptance gate. **Read it before coding.** That doc *is* your spec.

📚 If Genesis isn't responding, check `apm install` succeeded and your harness picked up `.apm/skills/genesis/`.

---

## 🛠️ Build (20 min)

Open `.apm/skills/my-skill/SKILL.md` (rename the folder to `test-improver/` if you like) and fill it in following Genesis's layout.

**Hard rules** (cribbed from `code-kit/instructions/prose-style.md` after `apm install`):

- **Frontmatter:** `name`, `description`, `license`, `allowed-tools`. Keep `allowed-tools` minimal — `Read, Grep, Glob, Bash(node:*), Bash(npm:*), Edit`
- **"When to use this skill":** specific trigger conditions, no fluff
- **Steps:** 3–7 imperative bullets
- **Outputs:** what files / comments / labels result

📁 Stuck? Peek at [`docs/golden-examples/test-improver.SKILL.md`](../golden-examples/test-improver.SKILL.md) — but only after you've written your own first draft.

---

## ✅ Validate locally (5 min)

In your IDE, drive the skill:

> "Use the test-improver skill on sample-app/"

Watch the agent:

1. Read `calculator.js`
2. Compare against `calculator.test.js`
3. Generate new tests under `tests/`
4. Run `npm test`
5. Iterate

When the loop converges, run yourself:

```bash
cd sample-app && npm test
```

You should see ~12+ tests passing, with `divide`, `power`, `factorial` covered.

---

## 📦 Package + publish (10 min)

```bash
apm run validate          # gh skill publish --dry-run .apm
git add . && git commit -m "feat: test-improver skill v0.1.0"
git tag v0.1.0 && git push origin main --tags
```

The release workflow (`.github/workflows/release.yml`) packs your skill and publishes a GitHub Release with the tarball attached.

---

## 🌐 Automate (5 min)

Open `.github/workflows/my-workflow.md`, retitle it `test-improver-on-pr.md`, and adjust the prompt to call your skill on any PR labeled `run-test-improver`.

Compile + commit:

```bash
gh aw compile
git add .github/workflows/ && git commit -m "ci: compile workflow"
git push
```

Open a PR that touches `sample-app/src/calculator.js`, label it `run-test-improver`, and watch your skill execute on the PR — that's the inner→outer loop transition.

---

## 🎓 What you learned

- **Genesis = design before code.** You wrote a spec, then implemented to it.
- **Skills are PROSE-shaped.** Every section has a job; no bloat, no duplication.
- **Local-first, CI second.** Same skill, same agent, same outcome — whether you run it in your IDE or as a `gh aw` job.
