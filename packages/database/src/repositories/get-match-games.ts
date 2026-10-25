import type { Connection } from '@tursodatabase/serverless';
import type { MatchGame, MatchGameForTeam } from '../types/match-game.js';
import type { CategoryKey } from '../types/match.js';

const MATCH_GAME_COLUMNS = `
  league_id,
  gender,
  phase,
  category,
  match_id,
  game_number,
  home_pair_points,
  away_pair_points,
  home_sets,
  away_sets,
  partials,
  home_player_1,
  home_player_1_points,
  home_player_2,
  home_player_2_points,
  away_player_1,
  away_player_1_points,
  away_player_2,
  away_player_2_points
`;

export async function getMatchGames(
  connection: Connection,
  category: CategoryKey,
  matchId: number,
): Promise<MatchGame[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT ${MATCH_GAME_COLUMNS}
          FROM match_games
          WHERE league_id = ?
            AND gender = ?
            AND phase = ?
            AND category = ?
            AND match_id = ?
          ORDER BY game_number
        `,
        args: [
          category.league_id,
          category.gender,
          category.phase,
          category.category,
          matchId,
        ],
      },
    ],
    'read',
  );

  return result.rows as MatchGame[];
}

export async function getMatchGamesByTeamId(
  connection: Connection,
  teamId: number,
): Promise<MatchGameForTeam[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            match_games.league_id,
            match_games.gender,
            match_games.phase,
            match_games.category,
            match_games.match_id,
            match_games.game_number,
            match_games.home_pair_points,
            match_games.away_pair_points,
            match_games.home_sets,
            match_games.away_sets,
            match_games.partials,
            match_games.home_player_1,
            match_games.home_player_1_points,
            match_games.home_player_2,
            match_games.home_player_2_points,
            match_games.away_player_1,
            match_games.away_player_1_points,
            match_games.away_player_2,
            match_games.away_player_2_points,
            matches.home_team_id,
            matches.away_team_id
          FROM match_games
          INNER JOIN matches
            ON matches.league_id = match_games.league_id
            AND matches.gender = match_games.gender
            AND matches.phase = match_games.phase
            AND matches.category = match_games.category
            AND matches.id = match_games.match_id
          WHERE matches.home_team_id = ?
             OR matches.away_team_id = ?
          ORDER BY match_games.match_id, match_games.game_number
        `,
        args: [teamId, teamId],
      },
    ],
    'read',
  );

  return result.rows as MatchGameForTeam[];
}
