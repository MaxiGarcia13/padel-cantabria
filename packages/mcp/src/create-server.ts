import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import packageJson from '../package.json';
import { assistantGet } from './assistant-client.js';
import { toolError, toolResult } from './tool-result.js';

/** String (not enum); API keeps only M/F via normalizeGender. */
const GENDER_OPTIONAL = z
  .string()
  .optional()
  .describe(
    'Include only when the user explicitly said masculine or feminine. Allowed values: M or F. Leave unset otherwise.',
  );

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  server.registerTool(
    'list_categories',
    {
      description:
        'List the full leagues tree with genders, phases, and categories. Prefer search_categories / search_phases for targeted lookup. Do not use to answer which teams are in a category (use list_teams). League is fixed by server config.',
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
    'search_categories',
    {
      description:
        'Search categories by independent tokens (e.g. "3ª"). League is fixed by server config. May return several matches. Do not invent gender.',
      inputSchema: {
        query: z.string().optional().describe('Category search tokens'),
        gender: GENDER_OPTIONAL,
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/categories/search', {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_phases',
    {
      description:
        'Search competition phases by independent tokens. League is fixed by server config. Use when the user asks about a phase or before standings/next match if phase is unclear.',
      inputSchema: {
        query: z.string().optional().describe('Phase search tokens'),
        gender: GENDER_OPTIONAL,
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/phases/search', {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'list_teams',
    {
      description:
        'List teams (and standings) in a category/group. Use when the user asks which teams are in a category. Requires gender M/F and category_value from search_categories. Optional phase_value from search_phases (defaults to the category phase). Do not use list_categories or search_teams for this.',
      inputSchema: {
        gender: z.enum(['M', 'F']).describe('M or F (ask user if unknown)'),
        category: z
          .string()
          .describe('category_value from search_categories (not the label)'),
        phase: z
          .string()
          .optional()
          .describe(
            'phase_value from search_phases; defaults to the category phase',
          ),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/teams', {
            gender: args.gender,
            category: args.category,
            phase: args.phase,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    {
      description:
        'Search teams by team name tokens only (not by category). League is fixed by server config. May return several matches; list them when ambiguous. Returns id, name, league/gender/category labels. To list all teams in a category/group, use list_teams.',
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe('One or more words from the team name'),
        limit: z.number().int().positive().optional(),
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
        'Team standing/position and next match for a phase. Use search_phases if phase is unknown. Pass phase_value from search_phases when needed. Does not return the roster; use list_team_players for that.',
      inputSchema: {
        team_id: z.number().int().positive().describe('Team id from search_teams'),
        phase: z
          .string()
          .optional()
          .describe(
            'Phase value (phase_value from search_phases); defaults to the first available phase',
          ),
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
    'list_team_players',
    {
      description:
        'List the roster (players) of one team. Use after search_teams to resolve team_id. If several teams match the name (e.g. same letter in M and F), list the matches or ask masculino/femenino before calling. Do not use search_players for "players in team X".',
      inputSchema: {
        team_id: z
          .number()
          .int()
          .positive()
          .describe('Team id from search_teams'),
      },
    },
    async ({ team_id: teamId }) => {
      try {
        return toolResult(await assistantGet(`/teams/${teamId}/players`));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_players',
    {
      description:
        'Search players by name/surname only. League is fixed by server config. Returns team, league, gender and category labels, points. Call with query only unless the user named a gender. If several genders match, ask masculino (M) or femenino (F).',
      inputSchema: {
        query: z
          .string()
          .describe(
            'Player name words only (e.g. "Maximiliano Garcia Mortigliengo")',
          ),
        gender: GENDER_OPTIONAL,
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/search', {
            q: args.query,
            gender: args.gender,
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
      description:
        'Top points in a category. League is fixed by server config. Requires category_value from search_categories and gender M/F. Ask the user if unknown.',
      inputSchema: {
        gender: z.enum(['M', 'F']).describe('M or F (ask user if unknown)'),
        category: z
          .string()
          .describe('category_value from search_categories (not the label)'),
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/top', {
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
