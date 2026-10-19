# `@padel-cantabria/mcp`

Stdio MCP shim for Claude Desktop, OpenCode, and other local MCP clients. Tools call the deployed (or local) assistant **HTTP API** — no Turso credentials on the client.

## Prerequisites

1. Install dependencies from the repo root: `pnpm install`
2. Start the assistant (or use a deployed host):

   ```bash
   pnpm assistant
   ```

   Default URL: `http://localhost:3001`

3. Keep that process running while the MCP client is connected.

For a deployed API, use that base URL instead of `localhost` below (no Turso env needed on the client).

### Absolute path to this repo

From the repo root, print the path to paste into configs below:

| OS                   | Command               |
| -------------------- | --------------------- |
| macOS / Linux        | `pwd`                 |
| Windows (PowerShell) | `(Get-Location).Path` |
| Windows (cmd)        | `cd`                  |

Example output: `/Users/you/Workspace/padel-cantabria` or `C:\Users\you\Workspace\padel-cantabria`.

## Claude Desktop

1. Open Claude Desktop → **Settings** → **Developer** → **Edit Config** (opens `claude_desktop_config.json`).
2. Merge the server entry below. Replace `/ABSOLUTE/PATH/to/padel-cantabria` with the path from [Absolute path to this repo](#absolute-path-to-this-repo).
3. Set `ASSISTANT_URL` to your assistant base URL (`http://localhost:3001` locally, or the deployed host).
4. Save the file and fully quit / reopen Claude Desktop.
5. Confirm **padel-cantabria** appears under MCP / tools, then ask something like “list categories”.

```json
{
  "mcpServers": {
    "padel-cantabria": {
      "command": "pnpm",
      "args": ["--dir", "/ABSOLUTE/PATH/to/padel-cantabria", "mcp"],
      "env": {
        "ASSISTANT_URL": "http://localhost:3001"
      }
    }
  }
}
```

## OpenCode

Prefer the assistant Streamable HTTP endpoint (same as Cursor). Local stdio via this package also works.

### Option A — remote HTTP (recommended)

1. Ensure the assistant is running (see [Prerequisites](#prerequisites)).
2. Open your OpenCode config:
   - Project: `opencode.json` (or `opencode.jsonc`) in the project root, or
   - Global: `~/.config/opencode/opencode.json`
3. Add the remote MCP server (use your deployed host + `/mcp` when not local):

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "mcp": {
       "padel-cantabria": {
         "type": "remote",
         "url": "http://localhost:3001/mcp",
         "enabled": true
       }
     }
   }
   ```

4. Restart OpenCode (or reload config).
5. Check the server is connected:

   ```bash
   opencode mcp list
   ```

6. In a chat, ask something like “list categories” (you can mention `padel-cantabria` if the model does not pick the tools on its own).

### Option B — local stdio

1. Ensure the assistant is running and note its base URL.
2. In `opencode.json` / `opencode.jsonc`, add a local server. Replace `/ABSOLUTE/PATH/to/padel-cantabria` with the path from [Absolute path to this repo](#absolute-path-to-this-repo):

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "mcp": {
       "padel-cantabria": {
         "type": "local",
         "command": [
           "pnpm",
           "--dir",
           "/ABSOLUTE/PATH/to/padel-cantabria",
           "mcp"
         ],
         "environment": {
           "ASSISTANT_URL": "http://localhost:3001"
         },
         "enabled": true
       }
     }
   }
   ```

3. Restart OpenCode and verify with `opencode mcp list`.

See [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers/) for config locations and options.

## Cursor / remote MCP

Prefer the assistant Streamable HTTP endpoint directly:

`http://localhost:3001/mcp` (or your deployed host + `/mcp`)

## Tools

- `list_categories`
- `search_categories`
- `search_phases`
- `search_teams`
- `get_team_overview`
- `list_team_players`
- `search_players`
- `get_top_players`

League id is applied by the assistant/MCP server from `LEAGUE_IDS` in `.env` (not from tool arguments). Scrapers keep using `LEAGUE_IDS` separately as an optional scrape filter.
