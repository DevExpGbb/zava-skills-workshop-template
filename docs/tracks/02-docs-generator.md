# Track 2 · `docs-generator`

> Build a skill that reads `sample-app/src/inventory.js`, detects undocumented exports, and emits JSDoc + a README usage section — without inventing behavior.

⏱️ **45 min** · 🎯 **PROSE focus:** **E**ngineering (context) + **S**kills

---

## 🔍 Discover the problem

Open [`sample-app/src/inventory.js`](../../sample-app/src/inventory.js).

Notice:

- Six exports (`restock`, `reserve`, `level`, `snapshot`, `lowStock`, `reset`)
- **Zero JSDoc**, no README, no inline explanation
- `reserve` returns a boolean (success/fail), but you can't tell from the signature
- `restock` throws on non-positive `qty` — silent contract

Now ask Copilot Chat (no skill, no context):

> "Add JSDoc to inventory.js"

Observe:

- Does it invent return-type semantics?
- Does it document the throw-on-zero contract for `restock`?
- Would two developers get the same JSDoc style?

**Documentation drift is more expensive than test drift** — readers trust docs even when they're wrong. A skill makes docs deterministic.

---

## 🧠 Design with Genesis (5 min)

```
/genesis I want a docs-generator skill. It must:
- Read all exports from sample-app/src/inventory.js
- Detect missing JSDoc
- Generate JSDoc with @param, @returns, @throws sections
- NEVER invent behavior — read the function body to derive @throws and return type
- Use Google-style JSDoc (consistent across team)
- Append a "Usage" section to sample-app/README.md with one example per export
- Stop after the first pass; humans review the diff
```

Genesis will return a layout with sections, contracts, and an acceptance gate.

📚 Notice Genesis will probably suggest a **rule file** (`.github/rules/jsdoc-style.md`) — Engineering primitive — to lock the style across runs. That's exactly what PROSE means by separating context from logic.

---

## 🛠️ Build (20 min)

In `.apm/skills/my-skill/SKILL.md` (rename to `docs-generator/`):

**Hard rules:**

- **`allowed-tools`:** `Read, Grep, Glob, Edit` — no shell, no npm. Documentation skills don't need execution.
- **"When to use":** "When source files have exported functions without JSDoc, AND the user has asked for documentation." Specificity prevents false triggers.
- **One read pass before writing.** Skill should never write JSDoc it can't trace to a line in the source.

📁 Reference: [`docs/golden-examples/docs-generator.SKILL.md`](../golden-examples/docs-generator.SKILL.md)

---

## ✅ Validate locally (5 min)

In your IDE:

> "Use the docs-generator skill on sample-app/src/inventory.js"

After the skill runs, inspect the diff:

- ✅ All 6 exports have JSDoc
- ✅ `restock` documents `@throws` for the qty contract
- ✅ `reserve` documents the boolean return semantics correctly
- ✅ `sample-app/README.md` gained a "Usage" section with one example per export

Manual sanity check: read three of the docstrings and ask "could a new dev call this function correctly using only this?"

---

## 📦 Package + publish (10 min)

```bash
apm run validate
git add . && git commit -m "feat: docs-generator skill v0.1.0"
git tag v0.1.0 && git push origin main --tags
```

---

## 🌐 Automate (5 min)

Adapt `.github/workflows/my-workflow.md` to label `run-docs-generator`. Compile, commit, push.

On any PR that touches files matching `sample-app/src/*.js`, the workflow appends JSDoc to changed files. You've turned documentation from a chore into a CI step.

---

## 🎓 What you learned

- **Skills can be read-only.** Not every skill needs Bash; minimal `allowed-tools` = safer skill.
- **Rules vs. skills.** A rule file (`.github/rules/`) holds *style* the skill *applies*. Separation = no copy-paste between skills.
- **Docs as a CI artifact.** Same loop as tests, different output type.
