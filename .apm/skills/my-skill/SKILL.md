---
name: my-skill
description: >-
  TODO — replace with a one-line, action-verb description of what your skill does.
  Run `/genesis` in your IDE first; it will give you the spec to fill this in.
license: UNLICENSED
allowed-tools: Read, Grep, Glob, Edit
---

# my-skill

> 🎨 **Blank canvas.** Don't write here yet.

## ✋ Stop — design first

This is the workshop's hardest discipline: **don't open a text editor and start typing**. Open your harness (Copilot CLI / Claude Code / Codex / Cursor) and invoke Genesis on the skill you want to build.

```
/genesis I want a <track-name> skill. It must:
- <constraint 1>
- <constraint 2>
- <constraint 3>
```

Genesis will produce a layout with sections, contracts, and an acceptance gate. **That's your spec.** Then come back here and write the SKILL.md by *implementing* it.

If you skip the design pass, you'll write a wall of text. Every skill that's failed to ship has skipped the design pass. Don't.

## 📁 Where to look

- The track guide for your chosen path: [`docs/tracks/`](../../../docs/tracks/)
- A working SKILL.md to peek at *after* you've drafted yours: [`docs/golden-examples/`](../../../docs/golden-examples/)
- PROSE style rules pinned via `apm install`: `.github/instructions/prose-style.md` (lives under code-kit)

---

## 🧱 SKILL.md skeleton

When you're ready, replace this entire file with your skill. The minimum sections:

### When to use this skill

> Specific trigger conditions. Be narrow. "When to use" is how the orchestrator decides to call you.

### What this skill does

> 3–7 imperative steps. Defer detail to referenced files in the same skill folder.

### Outputs

> Files? Comments? Labels? Be explicit.

### Constraints

> What this skill must *not* do. (Often more important than what it does.)

### Examples

> At least one concrete invocation example.
