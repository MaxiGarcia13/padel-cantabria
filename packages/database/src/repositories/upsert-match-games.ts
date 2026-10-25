import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { MatchGame } from '../types/match-game.js';

function buildUpsertStatement(game: MatchGame): BatchStatement {
  return {
    sql: `
      INSERT INTO match_games (
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
        away_player_2_points,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(league_id, gender, phase, category, match_id, game_number)
      DO UPDATE SET
        home_pair_points = excluded.home_pair_points,
        away_pair_points = excluded.away_pair_points,
        home_sets = excluded.home_sets,
        away_sets = excluded.away_sets,
        partials = excluded.partials,
        home_player_1 = excluded.home_player_1,
        home_player_1_points = excluded.home_player_1_points,
        home_player_2 = excluded.home_player_2,
        home_player_2_points = excluded.home_player_2_points,
        away_player_1 = excluded.away_player_1,
        away_player_1_points = excluded.away_player_1_points,
        away_player_2 = excluded.away_player_2,
        away_player_2_points = excluded.away_player_2_points,
        updated_at = datetime('now')
    `,
    args: [
      game.league_id,
      game.gender,
      game.phase,
      game.category,
      game.match_id,
      game.game_number,
      game.home_pair_points,
      game.away_pair_points,
      game.home_sets,
      game.away_sets,
      game.partials,
      game.home_player_1,
      game.home_player_1_points,
      game.home_player_2,
      game.home_player_2_points,
      game.away_player_1,
      game.away_player_1_points,
      game.away_player_2,
      game.away_player_2_points,
    ],
  };
}

export async function upsertMatchGames(
  games: MatchGame[],
  connection: Connection,
): Promise<void> {
  if (games.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(games.map(buildUpsertStatement), 'immediate');
}
