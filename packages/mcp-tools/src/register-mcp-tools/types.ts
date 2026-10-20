import type { MCP_TOOLS } from '../tools.js';

export interface McpToolArgs {
  list_categories: undefined;
  search_categories: {
    query?: string;
    gender?: string;
    limit?: number;
  };
  search_phases: {
    query?: string;
    gender?: string;
    limit?: number;
  };
  list_teams: {
    gender: 'M' | 'F';
    category: string;
    phase?: string;
  };
  search_teams: {
    query?: string;
    limit?: number;
  };
  get_team_overview: {
    team_id: number;
    phase?: string;
  };
  list_team_players: {
    team_id: number;
  };
  search_players: {
    query: string;
    gender?: string;
    limit?: number;
  };
  get_top_players: {
    gender: 'M' | 'F';
    category: string;
    limit?: number;
  };
}

export type McpToolHandlers = {
  [K in keyof typeof MCP_TOOLS]: (
    args: McpToolArgs[K],
  ) => Promise<unknown>;
};
