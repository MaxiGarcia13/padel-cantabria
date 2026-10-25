import type { Connection } from '@tursodatabase/serverless';
import type { League } from '../types/league.js';
import type { MatchGame } from '../types/match-game.js';
import type { MatchResult } from '../types/match-result.js';
import type { MatchWrite } from '../types/match.js';
import type { TeamPlayer } from '../types/team-player.js';
import type { TeamStanding } from '../types/team-standings.js';
import type { Team } from '../types/team.js';
import { upsertLeagues } from '../repositories/upsert-leagues.js';
import { upsertMatchGames } from '../repositories/upsert-match-games.js';
import { upsertMatchResults } from '../repositories/upsert-match-results.js';
import { upsertMatches } from '../repositories/upsert-matches.js';
import { upsertTeamPlayers } from '../repositories/upsert-team-players.js';
import { upsertTeamStandings } from '../repositories/upsert-team-standings.js';
import { upsertTeams } from '../repositories/upsert-teams.js';

export function createWrites(connection: Connection) {
  return {
    upsertLeagues: (leagues: League[]) => upsertLeagues(leagues, connection),
    upsertTeams: (teams: Team[]) => upsertTeams(teams, connection),
    upsertTeamStandings: (standings: TeamStanding[]) =>
      upsertTeamStandings(standings, connection),
    upsertTeamPlayers: (players: TeamPlayer[]) =>
      upsertTeamPlayers(players, connection),
    upsertMatches: (matches: MatchWrite[]) => upsertMatches(matches, connection),
    upsertMatchResults: (results: MatchResult[]) =>
      upsertMatchResults(results, connection),
    upsertMatchGames: (games: MatchGame[]) =>
      upsertMatchGames(games, connection),
  };
}
