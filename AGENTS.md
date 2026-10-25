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
| `packages/mcp-tools` | Shared MCP tool names/descriptions/zod  |
| `packages/assistant` | Fastify API + HTTP MCP + Vue chat UI    |
| `packages/mcp`       | Stdio MCP shim → assistant HTTP API     |
| `packages/scrapper`  | Puppeteer scrapers → Turso              |
| `packages/web`       | Astro + Vue frontend                    |

Package manager: **pnpm**. Env vars live in the **repo root** `.env` (`TURSO_URL`, `TURSO_AUTH_TOKEN`; optional `LEAGUE_IDS` for scrapers and the **web** app — when set, web team search is scoped to those leagues; when unset, web searches all leagues. **Required for the assistant/MCP**, which scopes all reads to the first configured league). Chat completions also need at least one of `GEMINI_API_KEY`, `OPEN_ROUTER_API_KEY`, `GROQ_API_KEY` (fallback order: Gemini → Open Router → Groq).

## Common commands (from repo root)

```bash
pnpm install
pnpm db:migrate          # CREATE TABLE IF NOT EXISTS only
pnpm db:reset            # wipe + recreate schema (then re-scrape)
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:players
pnpm scrape:calendar
pnpm scrape:results
pnpm dev                 # web app
pnpm assistant:build     # build Vue chat UI into assistant
pnpm assistant           # API + /mcp + chat UI (default :3001)
pnpm mcp                 # stdio MCP shim (needs ASSISTANT_URL)
pnpm lint
```

Scrape order matters. Details and when to re-run each script:

→ [packages/scrapper/README.md](packages/scrapper/README.md)

## Working notes for agents

- Prefer matching existing patterns in the package you touch (`web` composables/API routes, `database` upserts, scrapper parse/save split).
- Schema changes: prefer in-place `ALTER TABLE` (and update files under `packages/database/src/schema/`) over `db:reset`. Full reset is last resort; after reset, scrapers must be re-run in order. See `.cursor/rules/schema-changes.mdc`.
- Do not commit secrets (`.env`). Do not commit unless the user asks.
- Keep README / scrapper README accurate when changing scripts or env requirements.
