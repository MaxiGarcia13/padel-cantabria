import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';

function buildUpsertStatement(team: Team): BatchStatement {
  return {
    sql: `
      INSERT INTO teams (
        id,
        league_id,
        gender,
        category,
        name,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id)
      DO UPDATE SET
        league_id = excluded.league_id,
        gender = excluded.gender,
        category = excluded.category,
        name = excluded.name,
        updated_at = datetime('now')
    `,
    args: [
      team.id,
      team.league_id,
      team.gender,
      team.category,
      team.name,
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
