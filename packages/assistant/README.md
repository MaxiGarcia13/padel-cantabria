# `@padel-cantabria/assistant`

Deployable Fastify read API over Turso, Streamable HTTP MCP at `/mcp`, and a Vue + WebLLM chat UI.

## Run

From the repo root `.env`: `TURSO_URL`, `TURSO_AUTH_TOKEN`, and `LEAGUE_IDS` (required here to scope MCP/API reads; scrapers still use `LEAGUE_IDS` only as an optional filter).

```bash
pnpm --filter @padel-cantabria/assistant build:chat   # once (or after UI changes)
pnpm assistant                                         # API + MCP + chat UI on :3001
```

Dev (API and Vite UI separately):

```bash
pnpm assistant:dev    # API on :3001
pnpm --filter @padel-cantabria/assistant dev:chat   # UI on :5174 (proxies /mcp)
```

Default URL: `http://localhost:3001`. Override with `ASSISTANT_PORT` / `ASSISTANT_HOST`.

## Endpoints

League is taken from root `.env` `LEAGUE_IDS` (first id), not from query params.

| Method | Path                                    | Notes                              |
| ------ | --------------------------------------- | ---------------------------------- |
| `GET`  | `/`                                     | Vue chat UI (after `build:chat`)   |
| `GET`  | `/health`                               | `{ ok: true }`                     |
| `GET`  | `/categories`                           | League tree with labels            |
| `GET`  | `/categories/search?q=&gender=&limit=`  | Search categories (token match)    |
| `GET`  | `/phases/search?q=&gender=&limit=`      | Search phases (token match)        |
| `GET`  | `/teams/search?q=&limit=`               | Search teams (token match)         |
| `GET`  | `/teams/:id/overview?phase=`            | Team context, standing, next match |
| `GET`  | `/players/search?q=&gender=&limit=`     | Search players by name             |
| `GET`  | `/players/top?gender=&category=&limit=` | Top points in a category           |
| `POST` | `/mcp`                                  | Streamable HTTP MCP (same tools)   |

## Connect an LLM

- **Chat UI:** open `http://localhost:3001/` (WebLLM in browser → MCP)
- **Cursor / remote MCP URL:** `http://<host>:3001/mcp`
- **Claude Desktop (stdio):** [`packages/mcp`](../mcp/README.md) with `ASSISTANT_URL`
