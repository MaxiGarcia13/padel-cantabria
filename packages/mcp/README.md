# `@padel-cantabria/mcp`

Stdio MCP shim for Claude Desktop / local MCP clients. Tools call the deployed (or local) assistant **HTTP API** — no Turso credentials on the client.

## Prerequisites

1. Assistant running (`pnpm assistant`) or deployed
2. `ASSISTANT_URL` pointing at it (default `http://127.0.0.1:3001`)

## Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "padel-cantabria": {
      "command": "pnpm",
      "args": ["--dir", "/ABSOLUTE/PATH/to/padel-cantabria", "mcp"],
      "env": {
        "ASSISTANT_URL": "http://127.0.0.1:3001"
      }
    }
  }
}
```

For a deployed API, set `ASSISTANT_URL` to that base URL (no Turso env needed).

## Cursor / remote MCP

Prefer the assistant Streamable HTTP endpoint directly:

`http://127.0.0.1:3001/mcp` (or your deployed host + `/mcp`)

## Tools

- `list_categories`
- `search_teams`
- `get_team_overview`
- `search_players`
- `get_top_players`
