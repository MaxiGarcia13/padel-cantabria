import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { Match } from '../types/match.js';

function buildUpsertStatement(match: Match): BatchStatement {
  return {
    sql: `
      INSERT INTO matches (
        league_id,
        gender_value,
        phase_value,
        category_value,
        partido_id,
        home_team,
        away_team,
        date_label,
        status,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(league_id, gender_value, phase_value, category_value, partido_id)
      DO UPDATE SET
        home_team = excluded.home_team,
        away_team = excluded.away_team,
        date_label = excluded.date_label,
        status = excluded.status,
        updated_at = datetime('now')
    `,
    args: [
      match.league_id,
      match.gender_value,
      match.phase_value,
      match.category_value,
      match.partido_id,
      match.home_team,
      match.away_team,
      match.date_label,
      match.status,
    ],
  };
}

export async function upsertMatches(
  matches: Match[],
  connection: Connection,
): Promise<void> {
  if (matches.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(matches.map(buildUpsertStatement), 'immediate');
}
