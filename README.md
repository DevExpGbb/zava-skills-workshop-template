# zava-skills-workshop-template

> **Workshop trainee starter** — fork this template, build your first
> Agent Skill, package it with `apm pack`, distribute it via `gh skill
> publish`, and run it as a GitHub Agentic Workflow with `gh aw`. The
> full inner→outer loop in one repo.

```
┌───────────┐   ┌──────────┐   ┌───────────┐   ┌──────────────┐
│  DESIGN   │ → │  BUILD   │ → │  PACKAGE  │ → │   AUTOMATE   │
│ (Genesis) │   │ (locally │   │  + DIST.  │   │ (gh aw on PR)│
│           │   │  on app) │   │           │   │              │
└───────────┘   └──────────┘   └───────────┘   └──────────────┘
```

## What's in here

| Path | Purpose |
|------|---------|
| `apm.yml` | Pre-wired with workshop kits + Genesis + the `validate`/`pack` scripts |
| `.apm/skills/my-skill/SKILL.md` | Stub for **your** skill — fill it in |
| `sample-app/` | Embedded under-tested Node.js calculator — your skill's first target |
| `.github/workflows/release.yml` | Tag → validate → pack → GitHub Release on `v*.*.*` |
| `.github/workflows/my-workflow.md` | `gh aw` template invoking your skill on labeled PRs |
| `.github/workflows/shared/apm.md` | Standard APM shared bootstrap |

---

## Quick start

### 0 · Use this template

Click **"Use this template"** at the top of the GitHub repo page →
**"Create a new repository"**. Pick your own org + name. Clone it
locally.

### 1 · Install dependencies

```bash
apm install
```

This pulls the workshop kits (`secure-baseline`, `code-kit`,
`ideate-kit`, `review-kit`) and Genesis into `.github/`.

### 2 · Design your skill (Genesis)

Open the repo in your IDE with your agent of choice (Copilot CLI,
Claude Code, Codex). Ask Genesis to scope your skill:

> "Use the genesis skill to design a `test-improver` skill that reads
> `sample-app/src/calculator.js`, generates the missing tests in
> `sample-app/tests/calculator.test.js`, and iterates with `npm test`
> until all branches are covered."

Genesis will produce a design doc you can use to write `SKILL.md`.

### 3 · Build your skill

Edit `.apm/skills/my-skill/SKILL.md` (or rename the folder) following
the design Genesis produced. Keep it PROSE-shaped (see
`code-kit/instructions/prose-style.md` after `apm install`).

### 4 · Test locally

Run your agent against `sample-app/` and verify the skill behaves as
designed. Iterate on `SKILL.md` until it does.

### 5 · Validate against the open spec

```bash
apm run validate     # → gh skill publish --dry-run .apm
```

This catches frontmatter errors, naming mismatches, and packaging
issues **before** you publish.

### 6 · Pack + release

```bash
git tag v0.1.0 && git push origin v0.1.0
```

The `release` workflow validates, packs, and creates a GitHub Release
with your skill tarball attached.

### 7 · Pin from another repo

Any partner repo can now consume your skill:

```yaml
# their apm.yml
dependencies:
  apm:
    - <your-org>/<your-repo>#v0.1.0
```

Run `apm install` and your skill is theirs.

### 8 · Automate (outer loop)

The included `.github/workflows/my-workflow.md` is a `gh aw` template
that runs your skill on any PR labeled `run-my-skill`. Compile it:

```bash
gh aw compile
git add .github/workflows/ && git commit -m "ci: compile workflow"
git push
```

Then in **any consumer repo** that pinned your skill, label a PR with
`run-my-skill` and watch your skill execute on someone else's code.
**That's the platform claim.**

---

## Suggested skills to build during the workshop

Pick one. Build it end-to-end. The Block 3 storytelling beat is "your
skill, my project."

| Skill name | What it does | Lives in `sample-app/` |
|------------|--------------|------------------------|
| `test-improver` | Generate missing tests for `calculator.js` | `tests/` |
| `docs-generator` | Emit a `README.md` with usage examples | repo root |
| `dependency-auditor` | Scan `package.json`, propose remediations | as PR comment |

---

## Prerequisites

- `apm` CLI — see [microsoft/apm](https://github.com/microsoft/apm)
- `gh` CLI ≥ v2.90 — for `gh skill` (preview)
- `gh-aw` extension — `gh extension install github/gh-aw`
- An agent harness (Copilot CLI, Claude Code, Codex, etc.)
- Node.js ≥ 20 (for `sample-app/`)

---

## Workshop reference

This template ships as **Artifact #5** of the Lloyds Ph1 workshop (May
13). For the full Block 3 storyline, see the
[delivery plan](https://github.com/DevExpGbb/zava-workshop-kit).
