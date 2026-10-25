import type { Connection } from '@tursodatabase/serverless';
import type { GetTopPlayersParams } from '../repositories/get-top-players.js';
import type { SearchCategoriesParams } from '../repositories/search-categories.js';
import type { SearchPhasesParams } from '../repositories/search-phases.js';
import type { SearchPlayersParams } from '../repositories/search-players.js';
import { getTopPlayers } from '../repositories/get-top-players.js';
import { searchCategories } from '../repositories/search-categories.js';
import { searchPhases } from '../repositories/search-phases.js';
import { searchPlayers } from '../repositories/search-players.js';

export function createMcpReads(connection: Connection) {
  return {
    searchCategories: (params?: SearchCategoriesParams) =>
      searchCategories(connection, params),
    searchPhases: (params?: SearchPhasesParams) =>
      searchPhases(connection, params),
    searchPlayers: (params?: SearchPlayersParams) =>
      searchPlayers(connection, params),
    getTopPlayers: (params: GetTopPlayersParams) =>
      getTopPlayers(connection, params),
  };
}
