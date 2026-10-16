import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';

function buildUpsertStatement(team: Team): BatchStatement {
  return {
    sql: `
      INSERT INTO teams (
        id,
        league_id,
        gender,
        phase,
        category,
        name,
        confirmed,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id)
      DO UPDATE SET
        league_id = excluded.league_id,
        gender = excluded.gender,
        phase = excluded.phase,
        category = excluded.category,
        name = excluded.name,
        confirmed = excluded.confirmed,
        updated_at = datetime('now')
    `,
    args: [
      team.id,
      team.league_id,
      team.gender,
      team.phase,
      team.category,
      team.name,
      team.confirmed ? 1 : 0,
    ],
  };
}

export async function upsertTeams(
  teams: Team[],
  connection: Connection,
): Promise<void> {
  if (teams.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(teams.map(buildUpsertStatement), 'immediate');
}
