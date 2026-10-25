import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { MatchResult } from '../types/match-result.js';

function buildUpsertStatement(result: MatchResult): BatchStatement {
  return {
    sql: `
      INSERT INTO match_results (
        league_id,
        gender,
        phase,
        category,
        match_id,
        round,
        played_at,
        location,
        rounds_order,
        home_games,
        home_sets,
        home_matches,
        away_matches,
        away_sets,
        away_games,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(league_id, gender, phase, category, match_id)
      DO UPDATE SET
        round = excluded.round,
        played_at = excluded.played_at,
        location = excluded.location,
        rounds_order = excluded.rounds_order,
        home_games = excluded.home_games,
        home_sets = excluded.home_sets,
        home_matches = excluded.home_matches,
        away_matches = excluded.away_matches,
        away_sets = excluded.away_sets,
        away_games = excluded.away_games,
        updated_at = datetime('now')
    `,
    args: [
      result.league_id,
      result.gender,
      result.phase,
      result.category,
      result.match_id,
      result.round,
      result.played_at,
      result.location,
      result.rounds_order,
      result.home_games,
      result.home_sets,
      result.home_matches,
      result.away_matches,
      result.away_sets,
      result.away_games,
    ],
  };
}

export async function upsertMatchResults(
  results: MatchResult[],
  connection: Connection,
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(results.map(buildUpsertStatement), 'immediate');
}
