# Padel Cantabria

A clearer way to follow **teams, matches, and stats** from the Liga de Pádel de Cantabria.

The official source of truth is the
[Federación Cántabra de Pádel](https://federacioncantabradepadel.com) website.
This project does **not** replace it and is **not** affiliated with the federation.
It only aims to improve how that public information is viewed — clearer layout,
stats, and calendars.

Data is scraped from public federation pages and re-presented. This project does
**not** invent results. How scraping works and when to refresh data:

→ [packages/scrapper/README.md](packages/scrapper/README.md)

## What you can do here

- See leagues, teams, and match calendars in a more readable UI
- Follow team results and related stats without fighting the original site’s layout
- Ask an AI assistant about categories, teams, players, and rankings (browser chat or MCP in Cursor / Claude / OpenCode)

## AI assistant & MCP

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

## Contributing

Local setup, packages, scrape order, and workflow:

→ **[CONTRIBUTING.md](CONTRIBUTING.md)**

Coding agents working in this repo:

→ [AGENTS.md](AGENTS.md)
