# Contributing

Thanks for helping improve Padel Cantabria. This guide covers local setup and day-to-day workflow. Product overview: [README.md](README.md). Coding agents: [AGENTS.md](AGENTS.md).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) **12.14.0** (pinned in root `package.json` via `packageManager`)

Install pnpm once:

```bash
npm install -g pnpm
```

## Setup

From the **repo root**:

1. Clone the repo and run `pnpm install`.
2. Create a root `.env` with at least:

   ```env
   TURSO_URL=...
   TURSO_AUTH_TOKEN=...
   ```

   Optional / feature-specific:

   | Variable                                                  | Used by                 | Notes                                                                                                                          |
   | --------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
   | `LEAGUE_IDS`                                              | Scrapers, assistant/MCP | Optional filter for scrapers. **Required** for assistant/MCP (scopes reads to the first id). Web scopes from URL/query params. |
   | `GEMINI_API_KEY` / `OPEN_ROUTER_API_KEY` / `GROQ_API_KEY` | Assistant chat          | At least one; fallback order Gemini → Open Router → Groq.                                                                      |
   | `SCRAPE_GENDERS` / `SCRAPE_DELAY_MS`                      | Scrapers                | See [packages/scrapper/README.md](packages/scrapper/README.md).                                                                |

3. Apply the schema: `pnpm db:migrate` (or `pnpm db:reset` on a fresh or broken DB).
4. Run a full scrape sync (order matters):

   ```bash
   pnpm scrape:leagues
   pnpm scrape:teams
   pnpm scrape:players
   pnpm scrape:calendar
   pnpm scrape:results
   ```

5. Start the app you need: `pnpm dev` (web) or `pnpm assistant` (API + MCP + chat).

Details and when to re-run scrapers: [packages/scrapper/README.md](packages/scrapper/README.md).

## Packages

| Package                                    | Role                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [`packages/database`](packages/database)   | Schema, types, Turso client                                                    |
| [`packages/shared`](packages/shared)       | Reusable domain helpers (matches, standings, team labels)                      |
| [`packages/mcp-tools`](packages/mcp-tools) | Shared MCP tool names, descriptions, and Zod schemas                           |
| [`packages/assistant`](packages/assistant) | Fastify read API + HTTP MCP + chat UI ([docs](packages/assistant/README.md))   |
| [`packages/mcp`](packages/mcp)             | Stdio MCP shim → assistant HTTP API ([setup guide](packages/mcp/README.md))    |
| [`packages/scrapper`](packages/scrapper)   | Puppeteer scrapers ([scripts & when to run them](packages/scrapper/README.md)) |
| [`packages/web`](packages/web)             | Astro + Vue frontend                                                           |

## Common commands

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

## Workflow

- Match existing patterns in the package you touch (`web` composables/API routes, `database` upserts, scrapper parse/save split).
- Schema changes: prefer in-place `ALTER TABLE` (and update files under `packages/database/src/schema/`) over `db:reset`. Full reset is last resort; after reset, re-run scrapers in order. See [`.cursor/rules/schema-changes.mdc`](.cursor/rules/schema-changes.mdc).
- English in code, comments, logs, and API errors; Spanish only for user-visible UI copy. See [`.cursor/rules/language-conventions.mdc`](.cursor/rules/language-conventions.mdc).
- Do not commit secrets (`.env`).
- Run `pnpm lint` before opening a PR.
- When you change scripts or env requirements, update this file and the relevant package README.

## Docs map

| Audience                 | Doc                                                          |
| ------------------------ | ------------------------------------------------------------ |
| Users / product          | [README.md](README.md)                                       |
| Contributors (this file) | Setup, packages, workflow                                    |
| Coding agents            | [AGENTS.md](AGENTS.md)                                       |
| Scrapers                 | [packages/scrapper/README.md](packages/scrapper/README.md)   |
| MCP clients              | [packages/mcp/README.md](packages/mcp/README.md)             |
| Assistant API            | [packages/assistant/README.md](packages/assistant/README.md) |
