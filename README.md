# 🧰 Zava Skills Workshop Template

> **From "I have an idea for a skill" to "my skill ships on every PR" in one repo.** Design with [Genesis](https://github.com/danielmeppiel/genesis), build locally, validate against the open spec, package with `apm`, automate with `gh aw`.

[![Use this template](https://img.shields.io/badge/Use%20this-template-brightgreen?logo=github)](../../generate)
[![apm](https://img.shields.io/badge/apm-required-blue)](https://github.com/microsoft/apm)
[![gh-aw](https://img.shields.io/badge/gh--aw-required-blue)](https://github.com/githubnext/gh-aw)
[![Duration](https://img.shields.io/badge/Duration-90--180%20min-orange)]()

---

## 🤔 The problem this template solves

You've used Copilot. You've felt the ceiling:

- The same task gives **different output every time**
- Your team's conventions get **silently ignored**
- Skills you build live in *your* IDE — they don't ship, they don't compose, they don't run on someone else's PR
- There's no architecture: every skill is a one-off file, and the second one duplicates the first

**Skills are the way out.** But "build a skill" without scaffolding becomes another monolithic markdown file. This workshop makes you build one *with* scaffolding — design first, narrow scope, packaged for distribution, automated in CI.

---

## 🎯 What you'll build

By the end of this workshop, you'll have:

1. A **designed skill** — produced *with* [Genesis](https://github.com/danielmeppiel/genesis), not improvised
2. That skill **running locally** in your IDE on a real Node.js app (`sample-app/`)
3. The same skill **packaged + released** as a versioned tarball (`v0.1.0`)
4. The same skill **executing in CI** on PRs via [`gh aw`](https://github.com/githubnext/gh-aw)
5. A **consumer repo** pinning your skill via `apm` and getting the value automatically

You will have shipped the entire **PROSE** loop end to end:

| | Stands for | Where in this workshop |
|---|---|---|
| **P** | Prompts | The triggering messages in the workflow |
| **R** | Rules | Pinned style files via `apm install` |
| **O** | Orchestration | The skill itself coordinates read → analyze → emit |
| **S** | Skills | What you build |
| **E** | Engineering (Context) | The `.github/instructions/` you compose with |

> 📚 **Theory:** [PROSE Framework](https://github.com/danielmeppiel/awesome-ai-native) · [Genesis design patterns](https://github.com/danielmeppiel/genesis) · [APM marketplace](https://github.com/microsoft/apm)

---

## ⏱️ Session flow

| Section | Focus | Duration | Format |
|---|---|---|---|
| **0 · Setup** | Use template, install deps, verify CLIs | 10 min | Individual |
| **1 · Pick your track** | One of three | 5 min | Choose |
| **2 · Design with Genesis** | Spec your skill *before* you write it | 10 min | Hands-on |
| **3 · Build locally** | Author `SKILL.md`, drive it on `sample-app/` | 30 min | Hands-on |
| **4 · Validate + publish** | `gh skill publish --dry-run` → tag → release | 15 min | Hands-on |
| **5 · Automate in CI** | `gh aw compile` → label a PR → watch it run | 15 min | Hands-on |
| **6 · Consume from another repo** | Pin your skill in a partner repo via `apm` | 10 min | Demo |
| **Wrap-up** | What you shipped + how to extend tomorrow | 5 min | Discussion |

---

## ⚙️ Section 0 · Setup (10 min)

### Prerequisites

- [`apm`](https://github.com/microsoft/apm) — `brew install microsoft/apm/apm`
- [`gh`](https://cli.github.com) ≥ v2.90 — for `gh skill` (preview)
- [`gh aw`](https://github.com/githubnext/gh-aw) — `gh extension install github/gh-aw`
- An **agent harness**: Copilot CLI / Claude Code / Codex / Cursor / OpenCode
- **Node.js ≥ 20** (for `sample-app/`)

### 1. Use this template

Click the green **"Use this template"** button at the top of this repo → **"Create a new repository"**. Pick your own org + name. Clone it locally.

### 2. Install dependencies

```bash
apm install
```

This pulls in:

- The four **workshop kits** (`secure-baseline`, `code-kit`, `ideate-kit`, `review-kit`) — instructions, personas, hooks
- **Genesis** — your design assistant for new skills (`/genesis` in your harness)

### 3. Verify

```bash
apm run validate              # → gh skill publish --dry-run .apm
cd sample-app && npm test     # the existing skeleton test should pass
```

If both succeed, you're ready.

---

## 🛤️ Section 1 · Pick your track (5 min)

Each track teaches the same loop on different content. Pick **ONE** based on what you'll do in your day job.

| Track | What your skill will do | Best for |
|---|---|---|
| 🧪 [**1 · `test-improver`**](docs/tracks/01-test-improver.md) | Find untested branches in `calculator.js`, generate tests, iterate with `npm test` until green | Devs who want to raise coverage in legacy code |
| 📖 [**2 · `docs-generator`**](docs/tracks/02-docs-generator.md) | Read `inventory.js`, emit JSDoc + a README usage section without inventing behavior | Devs documenting brownfield modules |
| 🛡️ [**3 · `dependency-auditor`**](docs/tracks/03-dependency-auditor.md) | Run `npm audit`, classify SAFE vs BREAKING upgrades, emit a remediation plan as PR comment | Security-minded devs working in dep-heavy repos |

> 💡 Stuck choosing? Pick **`test-improver`** — it has the cleanest validation loop (`npm test` is the oracle).

Each track guide takes you through Sections 2–6 with track-specific content. Open your chosen track and follow it.

---

## 📂 What's in this repo

| Path | Purpose |
|---|---|
| `apm.yml` · `apm.lock.yaml` | Workshop kits + Genesis pinned. `apm install` reads this. |
| `.apm/skills/my-skill/SKILL.md` | **Your blank canvas.** Rename, fill in. |
| `sample-app/` | Node app with three deliberate gaps — under-tested calculator, undocumented inventory, vulnerable deps |
| `docs/tracks/` | Per-track exercise guides (Sections 2–6 expanded) |
| `docs/golden-examples/` | Reference `SKILL.md` per track — peek **after** you've drafted yours |
| `.github/workflows/release.yml` | Tag → validate → pack → GitHub Release on `v*.*.*` |
| `.github/workflows/my-workflow.md` | `gh aw` template — your skill running on labeled PRs |
| `.github/workflows/shared/apm.md` | Standard APM bootstrap shared module |

---

## 🌐 Section 6 · The platform claim

After Section 5, the same skill that runs in your IDE *also* runs as a `gh aw` workflow.

The final step proves the platform claim: **your skill, my code**. In any consumer repo, drop into their `apm.yml`:

```yaml
dependencies:
  apm:
    - <your-org>/<your-repo>#v0.1.0
```

Run `apm install` in their repo. Your skill is now theirs — same SKILL.md, same behavior, same outputs. Composable, versioned, reviewable.

That's the difference between a Copilot prompt and an Agent Skill: **distribution, lifecycle, and semantic versioning** — the same things you expect from any package manager.

---

## 🎓 What you took home

- **Design before code.** Genesis isn't a luxury — it's the architecture pass that prevents the monolith.
- **PROSE is the spec.** Every primitive (Prompts / Rules / Orchestration / Skills / Engineering) has a job. No primitive does another's work.
- **Skills ship like packages.** Tag → release → consumers pin. Same lifecycle as npm or pip.
- **Inner == outer loop.** Whatever runs in your IDE runs the same way in CI. No translation layer.

---

## 🔗 Going further

- Read the [PROSE Framework docs](https://github.com/danielmeppiel/awesome-ai-native) for the full theory
- Browse the [APM marketplace](https://github.com/microsoft/apm) for skills, instructions, personas to pin
- Use `/genesis` in your harness on real problems — not just workshop ones
- Open issues / send PRs on [zava-workshop-kit](https://github.com/DevExpGbb/zava-workshop-kit) — that's the deployer-facing entry point for running this workshop in your own org

---

## 📝 Workshop reference

This template is **Artifact #5** of the Zava agentic SDLC workshop. Org administrators provisioning the workshop should start at [`DevExpGbb/zava-workshop-kit`](https://github.com/DevExpGbb/zava-workshop-kit).
