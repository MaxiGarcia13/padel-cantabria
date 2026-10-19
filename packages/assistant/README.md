# `@padel-cantabria/assistant`

Deployable Fastify read API over Turso, plus Streamable HTTP MCP at `/mcp`.
The WebLLM chatbot will be served from this package next.

## Run

From the repo root (needs root `.env` with `TURSO_URL` and `TURSO_AUTH_TOKEN`):

```bash
pnpm assistant        # start
pnpm assistant:dev    # watch mode
```

Default listen: `0.0.0.0:3001`. Override with `ASSISTANT_PORT` / `ASSISTANT_HOST`.

## Endpoints

| Method | Path                                                     | Notes                              |
| ------ | -------------------------------------------------------- | ---------------------------------- |
| `GET`  | `/health`                                                | `{ ok: true }`                     |
| `GET`  | `/categories`                                            | League tree with labels            |
| `GET`  | `/teams/search?q=&limit=`                                | Search teams                       |
| `GET`  | `/teams/:id/overview?phase=`                             | Team context, standing, next match |
| `GET`  | `/players/search?q=&league_id=&gender=&category=&limit=` | Search players                     |
| `GET`  | `/players/top?league_id=&gender=&category=&limit=`       | Top points in a category           |
| `POST` | `/mcp`                                                   | Streamable HTTP MCP (same tools)   |

## Connect an LLM

- **Cursor / remote MCP URL:** `http://<host>:3001/mcp`
- **Claude Desktop (stdio):** use [`packages/mcp`](../mcp/README.md) with `ASSISTANT_URL` pointing at this server
