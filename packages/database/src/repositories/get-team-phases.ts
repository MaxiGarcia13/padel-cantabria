import type { Connection } from '@tursodatabase/serverless';

export async function getTeamPhases(
  connection: Connection,
  teamId: number,
): Promise<string[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT phase
          FROM (
            SELECT phase
            FROM team_standings
            WHERE team_id = ?
            UNION
            SELECT phase
            FROM matches
            WHERE home_team_id = ?
              OR away_team_id = ?
          )
          ORDER BY phase
        `,
        args: [teamId, teamId, teamId],
      },
    ],
    'read',
  );

  return (result.rows as { phase: string }[]).map((row) => String(row.phase));
}
