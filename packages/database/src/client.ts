import type { Connection } from '@tursodatabase/serverless';
import type { SearchTeamsParams } from './repositories/search-teams.js';
import type { League } from './types/league.js';
import type { CategoryKey, MatchWrite } from './types/match.js';
import type { TeamPlayer } from './types/team-player.js';
import type {
  TeamStanding,
  TeamWithStandings,
} from './types/team-standings.js';
import type { Team } from './types/team.js';
import { connect } from '@tursodatabase/serverless';
import { getCategories } from './repositories/get-categories.js';
import { getLeagues } from './repositories/get-leagues.js';
import { getMatchById } from './repositories/get-match-by-id.js';
import { getMatches } from './repositories/get-matches.js';
import { getTeamById } from './repositories/get-team-by-id.js';
import { getTeamMatches } from './repositories/get-team-matches.js';
import { getTeamPhases } from './repositories/get-team-phases.js';
import { getTeamPlayers } from './repositories/get-team-players.js';
import { getTeamStanding } from './repositories/get-team-standing.js';
import { getTeams } from './repositories/get-teams.js';
import { searchTeams } from './repositories/search-teams.js';
import { upsertLeagues } from './repositories/upsert-leagues.js';
import { upsertMatches } from './repositories/upsert-matches.js';
import { upsertTeamPlayers } from './repositories/upsert-team-players.js';
import { upsertTeamStandings } from './repositories/upsert-team-standings.js';
import { upsertTeams } from './repositories/upsert-teams.js';

export interface TursoConfig {
  url: string;
  authToken: string;
}

export function createConnection({ url, authToken }: TursoConfig): Connection {
  if (!url || !authToken) {
    throw new Error('Missing Turso url or authToken');
  }

  return connect({ url, authToken });
}

export function createClient(params: TursoConfig) {
  const connection = createConnection(params);

  function clientGetTeams(): Promise<Team[]>;
  function clientGetTeams(category: CategoryKey): Promise<TeamWithStandings[]>;
  function clientGetTeams(
    category?: CategoryKey,
  ): Promise<Team[] | TeamWithStandings[]> {
    return category === undefined
      ? getTeams(connection)
      : getTeams(connection, category);
  }

  function clientGetTeamPlayers(): Promise<TeamPlayer[]>;
  function clientGetTeamPlayers(teamId: number): Promise<TeamPlayer[]>;
  function clientGetTeamPlayers(teamId?: number): Promise<TeamPlayer[]> {
    return teamId === undefined
      ? getTeamPlayers(connection)
      : getTeamPlayers(connection, teamId);
  }

  return {
    getLeagues: () => getLeagues(connection),
    getCategories: () => getCategories(connection),
    getTeams: clientGetTeams,
    searchTeams: (params?: SearchTeamsParams) => searchTeams(connection, params),
    getTeamById: (id: number) => getTeamById(connection, id),
    getTeamPhases: (teamId: number) => getTeamPhases(connection, teamId),
    getTeamStanding: (teamId: number, category: CategoryKey) =>
      getTeamStanding(connection, teamId, category),
    getTeamMatches: (teamId: number, category: CategoryKey) =>
      getTeamMatches(connection, teamId, category),
    getTeamPlayers: clientGetTeamPlayers,
    getMatches: (category: CategoryKey) => getMatches(connection, category),
    getMatchById: (category: CategoryKey, id: number) =>
      getMatchById(connection, category, id),


    upsertLeagues: (leagues: League[]) => upsertLeagues(leagues, connection),
    upsertTeams: (teams: Team[]) => upsertTeams(teams, connection),
    upsertTeamStandings: (standings: TeamStanding[]) =>
      upsertTeamStandings(standings, connection),
    upsertTeamPlayers: (players: TeamPlayer[]) =>
      upsertTeamPlayers(players, connection),
    upsertMatches: (matches: MatchWrite[]) => upsertMatches(matches, connection),
  };
}
