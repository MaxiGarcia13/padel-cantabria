import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { McpToolHandlers } from '@padel-cantabria/mcp-tools';
import type { GetTopPlayersQuery } from '../handlers/get-top-players.js';
import type { ListTeamsQuery } from '../handlers/list-teams.js';
import type { SearchCategoriesQuery } from '../handlers/search-categories.js';
import type { SearchPhasesQuery } from '../handlers/search-phases.js';
import type { SearchPlayersQuery } from '../handlers/search-players.js';
import type { SearchTeamsQuery } from '../handlers/search-teams.js';
import {

  toRestQueryArgs,
} from '@padel-cantabria/mcp-tools';
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
      searchCategoriesHandler(
        db,
        toRestQueryArgs('search_categories', args) as SearchCategoriesQuery,
      ),
    search_phases: (args) =>
      searchPhasesHandler(
        db,
        toRestQueryArgs('search_phases', args) as SearchPhasesQuery,
      ),
    list_teams: (args) =>
      listTeamsHandler(
        db,
        toRestQueryArgs('list_teams', args) as ListTeamsQuery,
      ),
    search_teams: (args) =>
      searchTeamsHandler(
        db,
        toRestQueryArgs('search_teams', args) as SearchTeamsQuery,
      ),
    get_team_overview: (args) =>
      getTeamOverview(db, args.team_id, args.phase),
    list_team_players: (args) =>
      listTeamPlayersHandler(db, args.team_id),
    search_players: (args) =>
      searchPlayersHandler(
        db,
        toRestQueryArgs('search_players', args) as SearchPlayersQuery,
      ),
    get_top_players: (args) =>
      getTopPlayersHandler(
        db,
        toRestQueryArgs('get_top_players', args) as GetTopPlayersQuery,
      ),
  };
}
