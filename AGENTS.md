# AGENTS.md

Guidance for coding agents working on this repo.

## Project purpose

Padel Cantabria improves how people view **teams, matches, and stats** from the Liga de Pádel de Cantabria.

- Official source of truth: [Federación Cántabra de Pádel](https://federacioncantabradepadel.com)
- This project is **not** affiliated with the federation and does **not** replace their site
- Goal is UX only: clearer layout and a smoother way to browse public federation data
- Do not invent results; scrapers re-present public data from the federation site

Human-oriented overview: [README.md](README.md)

## Monorepo layout

| Package              | Role                                    |
| -------------------- | --------------------------------------- |
| `packages/database`  | Schema, types, Turso client             |
| `packages/shared`    | Reusable domain helpers (matches, etc.) |
| `packages/assistant` | Fastify API (+ MCP/chat later)          |
| `packages/scrapper`  | Puppeteer scrapers → Turso              |
| `packages/web`       | Astro + Vue frontend                    |

Package manager: **pnpm**. Env vars live in the **repo root** `.env` (`TURSO_URL`, `TURSO_AUTH_TOKEN`; optional `LEAGUE_IDS`).

## Common commands (from repo root)

```bash
pnpm install
pnpm db:migrate          # CREATE TABLE IF NOT EXISTS only
pnpm db:reset            # wipe + recreate schema (then re-scrape)
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:players
pnpm scrape:calendar
pnpm dev                 # web app
pnpm assistant           # Fastify read API (default :3001)
pnpm lint
```

Scrape order matters. Details and when to re-run each script:

→ [packages/scrapper/README.md](packages/scrapper/README.md)

## Working notes for agents

- Prefer matching existing patterns in the package you touch (`web` composables/API routes, `database` upserts, scrapper parse/save split).
- Schema changes: prefer in-place `ALTER TABLE` (and update `schema.sql`) over `db:reset`. Full reset is last resort; after reset, scrapers must be re-run in order. See `.cursor/rules/schema-changes.mdc`.
- Do not commit secrets (`.env`). Do not commit unless the user asks.
- Keep README / scrapper README accurate when changing scripts or env requirements.
