---
name: docs-generator
description: >-
  Read JavaScript modules and emit Google-style JSDoc plus a README usage
  section, deriving @throws and return semantics from the function body.
  Never invents behavior.
license: UNLICENSED
allowed-tools: Read, Grep, Glob, Edit
---

# docs-generator

> Deterministic JSDoc + usage docs for under-documented modules. Source-grounded; no fabrication.

## When to use this skill

Invoke when:

- A source file under `sample-app/src/*.js` has exported functions without JSDoc above them
- The user has asked for documentation, OR a `run-docs-generator` label is present on a PR

Do not invoke for: files where JSDoc already exists (use a separate doc-improver skill for refinement), test files, or generated code.

## What this skill does

1. **Read** the target source file end-to-end before writing anything.
2. **Identify** exports lacking JSDoc.
3. **Derive** the contract for each export by reading the body:
   - `@param` types from usage (treat lodash/axios as their own types)
   - `@returns` from the explicit return statements
   - `@throws` from any `throw new Error(...)` statements — quote the message verbatim
4. **Emit** Google-style JSDoc above each export. Never invent semantics; if unclear, use `@returns {*}` with a `// TODO: tighten type` comment.
5. **Append** a "## Usage" section to `sample-app/README.md` (create the README if missing) with one minimal example per export.

## Outputs

- Edited `sample-app/src/*.js` files with JSDoc inserted above each affected export
- New or extended `sample-app/README.md`
- Summary at `.skill-output/docs-generator-summary.md` listing exports documented

## Constraints

- Source-grounded only: every `@throws` must trace to a `throw` line; every `@returns` must trace to a `return` line
- Style: Google JSDoc (NOT TSDoc, NOT NumPy). Pinned by the rule file at `.github/rules/jsdoc-style.md` if present
- Idempotent: re-running on a file with full JSDoc must produce zero diff

## Examples

```
> Use the docs-generator skill on sample-app/src/inventory.js
```

Expected: 6 functions documented; `restock` has `@throws {Error} qty must be positive`; `reserve` documents boolean return semantics.
