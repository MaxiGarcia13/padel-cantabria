import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMcpTools } from '@padel-cantabria/mcp-tools';
import packageJson from '../package.json';
import { assistantGet } from './assistant-client.js';

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  registerMcpTools(server, {
    list_categories: () => assistantGet('/categories'),
    search_categories: (args) =>
      assistantGet('/categories/search', {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    search_phases: (args) =>
      assistantGet('/phases/search', {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    list_teams: (args) =>
      assistantGet('/teams', {
        gender: args.gender,
        category: args.category,
        phase: args.phase,
      }),
    search_teams: (args) =>
      assistantGet('/teams/search', { q: args.query, limit: args.limit }),
    get_team_overview: (args) =>
      assistantGet(`/teams/${args.team_id}/overview`, { phase: args.phase }),
    list_team_players: (args) =>
      assistantGet(`/teams/${args.team_id}/players`),
    search_players: (args) =>
      assistantGet('/players/search', {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    get_top_players: (args) =>
      assistantGet('/players/top', {
        gender: args.gender,
        category: args.category,
        limit: args.limit,
      }),
  });

  return server;
}
