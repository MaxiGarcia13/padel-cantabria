import type { Connection } from '@tursodatabase/serverless';
import type { GetLeaguesParams } from '../repositories/get-leagues.js';
import type { GetTeamsParams } from '../repositories/get-teams.js';
import type { SearchTeamsParams } from '../repositories/search-teams.js';
import type { CategoryKey } from '../types/match.js';
import type { TeamPlayer } from '../types/team-player.js';
import type { TeamWithStandings } from '../types/team-standings.js';
import type { Team } from '../types/team.js';
import { getLeagues } from '../repositories/get-leagues.js';
import { getTeamById } from '../repositories/get-team-by-id.js';
import { getTeamMatches } from '../repositories/get-team-matches.js';
import { getTeamPhases } from '../repositories/get-team-phases.js';
import { getTeamPlayers } from '../repositories/get-team-players.js';
import { getTeamStanding } from '../repositories/get-team-standing.js';
import { getTeams } from '../repositories/get-teams.js';
import { searchTeams } from '../repositories/search-teams.js';

export function createSharedReads(connection: Connection) {
  function clientGetTeams(): Promise<Team[]>;
  function clientGetTeams(category: CategoryKey): Promise<TeamWithStandings[]>;
  function clientGetTeams(params: GetTeamsParams): Promise<Team[]>;
  function clientGetTeams(
    categoryOrParams?: CategoryKey | GetTeamsParams,
  ): Promise<Team[] | TeamWithStandings[]> {
    if (categoryOrParams === undefined) {
      return getTeams(connection);
    }

    if ('league_id' in categoryOrParams) {
      return getTeams(connection, categoryOrParams);
    }

    return getTeams(connection, categoryOrParams);
  }

  function clientGetTeamPlayers(): Promise<TeamPlayer[]>;
  function clientGetTeamPlayers(teamId: number): Promise<TeamPlayer[]>;
  function clientGetTeamPlayers(teamId?: number): Promise<TeamPlayer[]> {
    return teamId === undefined
      ? getTeamPlayers(connection)
      : getTeamPlayers(connection, teamId);
  }

  return {
    getLeagues: (params?: GetLeaguesParams) => getLeagues(connection, params),
    getTeams: clientGetTeams,
    searchTeams: (params?: SearchTeamsParams) => searchTeams(connection, params),
    getTeamById: (id: number) => getTeamById(connection, id),
    getTeamPhases: (teamId: number) => getTeamPhases(connection, teamId),
    getTeamStanding: (teamId: number, category: CategoryKey) =>
      getTeamStanding(connection, teamId, category),
    getTeamMatches: (teamId: number, category: CategoryKey) =>
      getTeamMatches(connection, teamId, category),
    getTeamPlayers: clientGetTeamPlayers,
  };
}

export type SharedReadsClient = ReturnType<typeof createSharedReads>;
