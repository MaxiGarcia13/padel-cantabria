import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { MatchWrite } from '../types/match.js';

function buildUpsertStatement(match: MatchWrite): BatchStatement {
  return {
    sql: `
      INSERT INTO matches (
        league_id,
        gender,
        phase,
        category,
        id,
        home_team_id,
        away_team_id,
        date,
        status,
        location,
        schedule,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(league_id, gender, phase, category, id)
      DO UPDATE SET
        home_team_id = excluded.home_team_id,
        away_team_id = excluded.away_team_id,
        date = excluded.date,
        status = excluded.status,
        location = excluded.location,
        schedule = excluded.schedule,
        updated_at = datetime('now')
    `,
    args: [
      match.league_id,
      match.gender,
      match.phase,
      match.category,
      match.id,
      match.home_team_id,
      match.away_team_id,
      match.date,
      match.status,
      match.location,
      match.schedule,
    ],
  };
}

export async function upsertMatches(
  matches: MatchWrite[],
  connection: Connection,
): Promise<void> {
  if (matches.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(matches.map(buildUpsertStatement), 'immediate');
}
