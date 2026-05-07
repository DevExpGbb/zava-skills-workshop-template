# `target-app/` — workshop target

A small Next.js 14 + Postgres commerce slice. **Vendored snapshot** of [zava-storefront](https://github.com/DevExpGbb/zava-storefront) extended with a coherent vertical: product search → cart → checkout → order lookup → session helper.

You don't fix this app. You build **Skills** that help an agent operate on it. The app is the **test surface**, not the assignment.

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- Postgres (`pg`) for persistence
- `zod` for input validation
- Vitest for unit tests

## Layout

```
target-app/
├── app/api/                 # Next route handlers
│   ├── products/            # GET /api/products
│   ├── search/              # GET /api/search
│   ├── cart/                # POST/GET/DELETE /api/cart
│   ├── orders/              # POST /api/orders, GET /api/orders/:id
│   └── session/             # POST /api/session (login)
├── lib/                     # business logic
│   ├── db.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── search.ts
│   └── session.ts
├── tests/                   # vitest specs (deliberately partial)
└── security-fixtures/       # vulnerable-deps fixture (Track 3)
```

## Deliberate gaps (per track)

| Gap | Track |
|---|---|
| Untested branches in `lib/cart.ts` and `lib/orders.ts` (tax, discount, edge cases) | **Track 1 · `test-improver`** |
| Missing JSDoc on every `lib/*.ts` business function | **Track 2 · `docs-generator`** |
| Vulnerable deps in `security-fixtures/` | **Track 3 · `dependency-auditor`** |

## Run

```bash
npm install --prefix target-app
npm test --prefix target-app    # green from clean checkout (the gaps are uncovered branches, not failing tests)
```

The workshop standardizes on **npm** (matches `release.yml` and `gh aw` workflow).

## DB note

`lib/db.ts` reads `DATABASE_URL` and falls back to a no-op stub for local-dev / workshop use. Tests don't touch a real DB — the route handlers are exercised with an injected fake. **The workshop never requires a running Postgres.**
