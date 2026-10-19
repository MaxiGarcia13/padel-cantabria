# Padel Cantabria

A clearer way to follow **teams, matches, and stats** from the Liga de Pádel de Cantabria.

The official source of truth is the
[Federación Cántabra de Pádel](https://federacioncantabradepadel.com) website.
This project does **not** replace it and is **not** affiliated with the federation.
It only aims to improve how that public information is viewed — clearer layout,
stats, and calendars.

## Official website

→ [federacioncantabradepadel.com](https://federacioncantabradepadel.com)

## What you can do here

- See leagues, teams, and match calendars in a more readable UI
- Follow team results and related stats without fighting the original site’s layout
- Ask an AI assistant about categories, teams, players, and rankings (browser chat or MCP in Cursor / Claude / OpenCode)

## AI assistant & MCP

You can use the league assistant in two ways:

| Option                                            | Link                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| Chat in the browser                               | [padel-cantabria.onrender.com](https://padel-cantabria.onrender.com/) |
| Connect Cursor, Claude Desktop, or OpenCode (MCP) | `https://padel-cantabria.onrender.com/mcp`                            |

No database account is required. Step-by-step setup (hosted and local), including config examples for each app:

→ **[packages/mcp/README.md](packages/mcp/README.md)**

### Examples

| App         | Demo                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| OpenCode    | [Watch](https://github.com/MaxiGarcia13/padel-cantabria/blob/main/docs/open-code-example.mov)   |
| Claude Code | [Watch](https://github.com/MaxiGarcia13/padel-cantabria/blob/main/docs/claude-code-example.mov) |

## Where the data comes from

Data is copied automatically from the Federación Cántabra de Pádel website (a “scraper”: a script that reads public pages and stores the useful bits in a database so the web app can show them nicely).

This project does **not** invent results. It re-presents public federation data.

For how scraping works, which scripts to run, and when to refresh data, see:

→ [packages/scrapper/README.md](packages/scrapper/README.md)

## For developers

Monorepo: scrape federation data into Turso and serve it on the web.

### Packages

- [`packages/database`](packages/database) — schema, types, Turso client
- [`packages/shared`](packages/shared) — reusable domain helpers (matches, standings, team labels)
- [`packages/assistant`](packages/assistant) — Fastify read API + HTTP MCP + chat UI ([docs](packages/assistant/README.md))
- [`packages/mcp`](packages/mcp) — MCP setup for Cursor / Claude / OpenCode ([setup guide](packages/mcp/README.md))
- [`packages/scrapper`](packages/scrapper) — Puppeteer scrapers ([scripts & when to run them](packages/scrapper/README.md))
- [`packages/web`](packages/web) — Astro + Vue frontend

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) **12.11.2** (pinned in `package.json` via `packageManager`)

Install pnpm once:

```bash
npm install -g pnpm
```

### Quick start

From the **repo root**:

```bash
pnpm install
pnpm db:reset   # or `pnpm db:migrate` on an empty DB
pnpm scrape:leagues
pnpm scrape:teams
pnpm scrape:players
pnpm scrape:calendar
pnpm dev
```

See [packages/scrapper/README.md](packages/scrapper/README.md) for env vars, script details, and when to re-run each scraper.
