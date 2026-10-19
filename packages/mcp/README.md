# Padel Cantabria MCP — setup guide

Connect **Cursor**, **Claude Desktop**, or **OpenCode** to Liga de Pádel de Cantabria data (categories, teams, players, rankings).

You do **not** need a database account. The tools talk to an assistant API — either the public one online, or a copy you run on your computer.

## What is MCP?

**MCP** (Model Context Protocol) lets AI apps use extra tools. After you connect, you can ask things like “lista las categorías” or “quiénes son los mejores jugadores” and the AI will fetch real league data.

## Two ways to connect

| Option                      | When to use              | What you need                                                   |
| --------------------------- | ------------------------ | --------------------------------------------------------------- |
| **A. Hosted (recommended)** | You just want it to work | An AI app that supports MCP. No coding.                         |
| **B. Local**                | You develop this project | This repo, Node/pnpm, and the assistant running on your machine |

---

## Option A — Hosted (no install)

Public assistant:

| What                    | URL                                      |
| ----------------------- | ---------------------------------------- |
| Chat in the browser     | https://padel-cantabria.onrender.com/    |
| MCP endpoint (for apps) | https://padel-cantabria.onrender.com/mcp |

> The free Render service may take ~30–60 seconds to wake up the first time. If the first request fails, wait a minute and try again.

### Cursor

1. Open **Cursor Settings** → **MCP**.
2. Add a new MCP server (HTTP / remote).
3. Use this URL:

   `https://padel-cantabria.onrender.com/mcp`

4. Save and confirm the server shows as connected.
5. In chat, try: _“lista las categorías de la liga”_ or _“list categories”_.

Example config (`.cursor/mcp.json` or Cursor MCP settings — exact keys may vary by Cursor version):

```json
{
  "mcpServers": {
    "padel-cantabria": {
      "url": "https://padel-cantabria.onrender.com/mcp"
    }
  }
}
```

If your Cursor version asks for a `type`, choose remote/HTTP and use the same URL.

### OpenCode

1. Open your OpenCode config:
   - Project: `opencode.json` (or `opencode.jsonc`) in the project root, or
   - Global: `~/.config/opencode/opencode.json`
2. Add:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "padel-cantabria": {
      "type": "remote",
      "url": "https://padel-cantabria.onrender.com/mcp",
      "enabled": true
    }
  }
}
```

3. Restart OpenCode (or reload config).
4. Optional check: `opencode mcp list`
5. Ask: _“list categories”_.

More detail: [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers/).

### Claude Desktop

Claude Desktop usually connects through a **local command** (stdio), so you still need this repo on your computer — even when the API is hosted.

1. Clone this repository and run `pnpm install` from the repo root (once).
2. Follow [Claude Desktop — stdio shim](#claude-desktop--stdio-shim) below.
3. Set `ASSISTANT_URL` to the hosted base URL (**no** `/mcp` at the end):

```text
ASSISTANT_URL=https://padel-cantabria.onrender.com
```

---

## Option B — Local

Use this if you contribute to the project or want everything on your machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- This repository cloned
- Root `.env` set up for the assistant (`TURSO_URL`, `TURSO_AUTH_TOKEN`, `LEAGUE_IDS`; plus an LLM key if you use the chat UI — see [`packages/assistant/README.md`](../assistant/README.md))

### 2. Install and start the assistant

From the **repo root**:

```bash
pnpm install
pnpm assistant
```

Leave that terminal open. Default addresses:

| What       | URL                         |
| ---------- | --------------------------- |
| Chat / API | `http://localhost:3001`     |
| MCP        | `http://localhost:3001/mcp` |

### 3. Absolute path to this repo

You will paste this path into configs. From the repo root:

| OS                   | Command               |
| -------------------- | --------------------- |
| macOS / Linux        | `pwd`                 |
| Windows (PowerShell) | `(Get-Location).Path` |
| Windows (cmd)        | `cd`                  |

Example: `/Users/you/Workspace/padel-cantabria` or `C:\Users\you\Workspace\padel-cantabria`.

### Cursor / OpenCode — local HTTP

Same as Option A, but use:

`http://localhost:3001/mcp`

Keep `pnpm assistant` running while you chat.

### Claude Desktop — stdio shim

1. Open Claude Desktop → **Settings** → **Developer** → **Edit Config** (opens `claude_desktop_config.json`).
2. Merge the server entry below. Replace `/ABSOLUTE/PATH/to/padel-cantabria` with the path from [Absolute path to this repo](#3-absolute-path-to-this-repo).
3. Set `ASSISTANT_URL` to `http://localhost:3001` (local) or `https://padel-cantabria.onrender.com` (hosted). Do **not** append `/mcp`.
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

Hosted API without running the assistant locally:

```
"env": {
  "ASSISTANT_URL": "https://padel-cantabria.onrender.com"
}
```

### OpenCode — local stdio (optional)

Prefer remote HTTP when you can. Stdio also works:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "padel-cantabria": {
      "type": "local",
      "command": ["pnpm", "--dir", "/ABSOLUTE/PATH/to/padel-cantabria", "mcp"],
      "environment": {
        "ASSISTANT_URL": "http://localhost:3001"
      },
      "enabled": true
    }
  }
}
```

Restart OpenCode and verify with `opencode mcp list`.

---

## Quick test

After connecting, ask something simple:

- “Lista las categorías”
- “List categories”
- “Busca el equipo …”

If tools fail:

1. Open https://padel-cantabria.onrender.com/ in a browser (or `http://localhost:3001` locally).
2. On Render, wait for the cold start, then retry.
3. For Cursor / OpenCode remote config, the URL must end with `/mcp`.
4. For Claude Desktop, `ASSISTANT_URL` must **not** end with `/mcp`.

## Prefer the chat UI?

You can use the assistant in the browser with no MCP setup:

→ https://padel-cantabria.onrender.com/

## Available tools

- `list_categories`
- `search_categories`
- `search_phases`
- `search_teams`
- `get_team_overview`
- `list_team_players`
- `search_players`
- `get_top_players`

The league is fixed by the server (`LEAGUE_IDS` in `.env`). You do not pass a league id in the tools.
