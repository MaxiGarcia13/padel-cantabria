import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';
import { getMatchById } from '../repositories/get-match-by-id.js';
import {
  getMatchGames,
  getMatchGamesByMatchIds,
  getMatchGamesByTeamId,
} from '../repositories/get-match-games.js';
import { getMatchResults } from '../repositories/get-match-results.js';
import { getMatches } from '../repositories/get-matches.js';

export function createWebReads(connection: Connection) {
  return {
    getMatches: (category: CategoryKey) => getMatches(connection, category),
    getMatchById: (category: CategoryKey, id: number) =>
      getMatchById(connection, category, id),
    getMatchResults: (category: CategoryKey, matchIds?: number[]) =>
      getMatchResults(connection, category, matchIds),
    getMatchGames: (category: CategoryKey, matchId: number) =>
      getMatchGames(connection, category, matchId),
    getMatchGamesByMatchIds: (category: CategoryKey, matchIds: number[]) =>
      getMatchGamesByMatchIds(connection, category, matchIds),
    getMatchGamesByTeamId: (teamId: number) =>
      getMatchGamesByTeamId(connection, teamId),
  };
}
