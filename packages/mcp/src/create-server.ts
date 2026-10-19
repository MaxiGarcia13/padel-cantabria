import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import packageJson from '../package.json';
import { assistantGet } from './assistant-client.js';
import { toolError, toolResult } from './tool-result.js';

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  server.registerTool(
    'list_categories',
    {
      description:
        'List leagues with genders, phases, and categories (values and Spanish labels).',
    },
    async () => {
      try {
        return toolResult(await assistantGet('/categories'));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    {
      description: 'Search teams by name. Returns id, league, gender, category.',
      inputSchema: {
        query: z.string().optional().describe('Team name fragment'),
        limit: z.number().int().positive().optional().describe('Max results'),
      },
    },
    async ({ query, limit }) => {
      try {
        return toolResult(
          await assistantGet('/teams/search', { q: query, limit }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_team_overview',
    {
      description:
        'Team competition context, standing/position, and next match for a phase.',
      inputSchema: {
        team_id: z.number().int().positive().describe('Team id from search_teams'),
        phase: z
          .string()
          .optional()
          .describe('Phase value; defaults to the first available phase'),
      },
    },
    async ({ team_id: teamId, phase }) => {
      try {
        return toolResult(
          await assistantGet(`/teams/${teamId}/overview`, { phase }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_players',
    {
      description:
        'Search players by name or surname. Returns points, team, and category.',
      inputSchema: {
        query: z.string().optional().describe('Player name or surname'),
        league_id: z.number().int().positive().optional(),
        gender: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/search', {
            q: args.query,
            league_id: args.league_id,
            gender: args.gender,
            category: args.category,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_top_players',
    {
      description: 'Players with most points in a league gender/category.',
      inputSchema: {
        league_id: z.number().int().positive(),
        gender: z.string(),
        category: z.string(),
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/top', {
            league_id: args.league_id,
            gender: args.gender,
            category: args.category,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
