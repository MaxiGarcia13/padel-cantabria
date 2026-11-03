import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { McpToolHandlers } from '@padel-cantabria/mcp-tools';
import { getTeamOverview } from '../handlers/get-team-overview.js';
import { getTopPlayersHandler } from '../handlers/get-top-players.js';
import { listCategories } from '../handlers/list-categories.js';
import { listTeamPlayersHandler } from '../handlers/list-team-players.js';
import { listTeamsHandler } from '../handlers/list-teams.js';
import { searchCategoriesHandler } from '../handlers/search-categories.js';
import { searchPhasesHandler } from '../handlers/search-phases.js';
import { searchPlayersHandler } from '../handlers/search-players.js';
import { searchTeamsHandler } from '../handlers/search-teams.js';

export function createMcpHandlers(db: McpDatabaseClient): McpToolHandlers {
  return {
    list_categories: () => listCategories(db),
    search_categories: (args) =>
      searchCategoriesHandler(db, {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    search_phases: (args) =>
      searchPhasesHandler(db, {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    list_teams: (args) =>
      listTeamsHandler(db, {
        gender: args.gender,
        category: args.category,
        phase: args.phase,
      }),
    search_teams: (args) =>
      searchTeamsHandler(db, { q: args.query, limit: args.limit }),
    get_team_overview: (args) =>
      getTeamOverview(db, args.team_id, args.phase),
    list_team_players: (args) =>
      listTeamPlayersHandler(db, args.team_id),
    search_players: (args) =>
      searchPlayersHandler(db, {
        q: args.query,
        gender: args.gender,
        limit: args.limit,
      }),
    get_top_players: (args) =>
      getTopPlayersHandler(db, {
        gender: args.gender,
        category: args.category,
        limit: args.limit,
      }),
  };
}
