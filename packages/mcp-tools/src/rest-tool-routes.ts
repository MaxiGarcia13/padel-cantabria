import type { McpToolArgs, McpToolName } from './register-mcp-tools/types.js';

interface RestToolRoute {
  path: string;
  query?: Record<string, string>;
}

export const REST_TOOL_ROUTES: Record<McpToolName, RestToolRoute> = {
  list_categories: { path: '/categories' },
  search_categories: {
    path: '/categories/search',
    query: { query: 'q', gender: 'gender', limit: 'limit' },
  },
  search_phases: {
    path: '/phases/search',
    query: { query: 'q', gender: 'gender', limit: 'limit' },
  },
  list_teams: {
    path: '/teams',
    query: { gender: 'gender', category: 'category', phase: 'phase' },
  },
  search_teams: {
    path: '/teams/search',
    query: { query: 'q', limit: 'limit' },
  },
  get_team_overview: {
    path: '/teams/:team_id/overview',
    query: { phase: 'phase' },
  },
  list_team_players: {
    path: '/teams/:team_id/players',
  },
  search_players: {
    path: '/players/search',
    query: { query: 'q', gender: 'gender', limit: 'limit' },
  },
  get_top_players: {
    path: '/players/top',
    query: { gender: 'gender', category: 'category', limit: 'limit' },
  },
};

type RestQuery = Record<string, string | number | undefined>;

function asArgRecord(
  args: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  return args ?? {};
}

export function buildRestRequest(
  name: McpToolName,
  args?: Record<string, unknown> | null,
): { path: string; query: RestQuery } {
  const route = REST_TOOL_ROUTES[name];
  const source = asArgRecord(args);

  const path = route.path.replace(/:(\w+)/g, (_, key: string) => {
    const value = source[key];
    if (value === undefined || value === null || value === '') {
      throw new Error(`Missing path param "${key}" for tool ${name}`);
    }
    return encodeURIComponent(String(value));
  });

  const query: RestQuery = {};
  if (route.query) {
    for (const [mcpKey, restKey] of Object.entries(route.query)) {
      const value = source[mcpKey];
      if (value === undefined || value === null || value === '') {
        continue;
      }
      query[restKey] = value as string | number;
    }
  }

  return { path, query };
}

export function toRestQueryArgs<Name extends McpToolName>(
  name: Name,
  args: McpToolArgs[Name],
): RestQuery {
  return buildRestRequest(
    name,
    args as Record<string, unknown> | null | undefined,
  ).query;
}
