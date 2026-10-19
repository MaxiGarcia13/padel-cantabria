# `@padel-cantabria/assistant`

Deployable Fastify read API over Turso, Streamable HTTP MCP at `/mcp`, and a Vue chat UI that calls cloud LLMs via `@maxigarcia/ai-router`.

## Run

From the repo root `.env`: `TURSO_URL`, `TURSO_AUTH_TOKEN`, and `LEAGUE_IDS` (required here to scope MCP/API reads; scrapers still use `LEAGUE_IDS` only as an optional filter).

For chat completions, set at least one of: `GEMINI_API_KEY`, `OPEN_ROUTER_API_KEY`, `GROQ_API_KEY`. Fallback order is Gemini → Open Router → Groq (providers without a key are skipped).

```bash
pnpm --filter @padel-cantabria/assistant build:chat   # once (or after UI changes)
pnpm assistant                                         # API + MCP + chat UI on :3001
```

Dev (API and Vite UI separately):

```bash
pnpm assistant:dev    # API on :3001
pnpm --filter @padel-cantabria/assistant dev:chat   # UI on :5174 (proxies /mcp and /chat)
```

Default URL: `http://localhost:3001`. Override with `ASSISTANT_PORT` / `ASSISTANT_HOST`.

## Endpoints

League is taken from root `.env` `LEAGUE_IDS` (first id), not from query params.

| Method | Path                                    | Notes                                  |
| ------ | --------------------------------------- | -------------------------------------- |
| `GET`  | `/`                                     | Vue chat UI (after `build:chat`)       |
| `GET`  | `/health`                               | `{ ok: true }`                         |
| `GET`  | `/categories`                           | League tree with labels                |
| `GET`  | `/categories/search?q=&gender=&limit=`  | Search categories (token match)        |
| `GET`  | `/phases/search?q=&gender=&limit=`      | Search phases (token match)            |
| `GET`  | `/teams?gender=&category=&phase=`       | Teams + standings in a category        |
| `GET`  | `/teams/search?q=&limit=`               | Search teams (token match)             |
| `GET`  | `/teams/:id/overview?phase=`            | Team context, standing, next match     |
| `GET`  | `/teams/:id/players`                    | Team roster (players)                  |
| `GET`  | `/players/search?q=&gender=&limit=`     | Search players by name                 |
| `GET`  | `/players/top?gender=&category=&limit=` | Top points in a category               |
| `POST` | `/chat/completions`                     | AiRouter (Gemini → Open Router → Groq) |
| `POST` | `/mcp`                                  | Streamable HTTP MCP (same tools)       |

## Connect an LLM

- **Chat UI:** open `http://localhost:3001/` (Vue → `/chat/completions` → MCP)
- **Cursor / remote MCP URL:** `http://<host>:3001/mcp`
- **Claude Desktop (stdio):** [`packages/mcp`](../mcp/README.md) with `ASSISTANT_URL`
