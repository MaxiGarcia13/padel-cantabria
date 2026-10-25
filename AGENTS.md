# AGENTS.md

Guidance for coding agents working on this repo.

Humans: [README.md](README.md) (product) · [CONTRIBUTING.md](CONTRIBUTING.md) (setup & workflow).

## Purpose (constraints)

- UX over public Liga de Pádel de Cantabria data from the [Federación Cántabra de Pádel](https://federacioncantabradepadel.com)
- Not affiliated with the federation; does not replace their site
- Do not invent results; scrapers re-present public federation data

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

Package manager: **pnpm**. Env vars live in the **repo root** `.env`.

| Variable                                                  | Notes                                                                                                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TURSO_URL`, `TURSO_AUTH_TOKEN`                           | Required for DB access                                                                                                                                |
| `LEAGUE_IDS`                                              | Optional for scrapers (limits what is ingested). **Required** for assistant/MCP (scopes all reads to the first id). Web scopes from URL/query params. |
| `GEMINI_API_KEY` / `OPEN_ROUTER_API_KEY` / `GROQ_API_KEY` | Chat: at least one; fallback Gemini → Open Router → Groq                                                                                              |

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

## Working rules

- Prefer matching existing patterns in the package you touch (`web` composables/API routes, `database` upserts, scrapper parse/save split).
- Schema changes: prefer in-place `ALTER TABLE` (and update files under `packages/database/src/schema/`) over `db:reset`. Full reset is last resort; after reset, scrapers must be re-run in order. See [`.cursor/rules/schema-changes.mdc`](.cursor/rules/schema-changes.mdc).
- Filter in SQL (or via repo params that become SQL), not `getAll*` then `.filter()` in JS. Use `ListScopeParams` / `buildListScopeFilter` and pass `{ leagueIds, genders }` into repos. See [`.cursor/rules/sql-filtering.mdc`](.cursor/rules/sql-filtering.mdc).
- English in code, comments, logs, and API error payloads; Spanish only for user-visible UI copy. See [`.cursor/rules/language-conventions.mdc`](.cursor/rules/language-conventions.mdc).
- Keep modules small and focused; naming: kebab-case files/folders, camelCase functions/locals, UPPER_SNAKE_CASE global constants. See [`.cursor/rules/small-modules.mdc`](.cursor/rules/small-modules.mdc) and [`.cursor/rules/naming-conventions.mdc`](.cursor/rules/naming-conventions.mdc).
- Minimal comments: no JSDoc; comment only non-obvious constraints. See [`.cursor/rules/minimal-comments.mdc`](.cursor/rules/minimal-comments.mdc).
- Do not commit secrets (`.env`). Do not commit unless the user asks.
- Keep [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md), and package READMEs accurate when changing scripts or env requirements.
