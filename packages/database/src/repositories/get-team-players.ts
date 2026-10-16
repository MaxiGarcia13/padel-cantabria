import type { Connection } from '@tursodatabase/serverless';
import type { TeamPlayer } from '../types/team-player.js';

export async function getTeamPlayers(
  connection: Connection,
): Promise<TeamPlayer[]>;
export async function getTeamPlayers(
  connection: Connection,
  teamId: number,
): Promise<TeamPlayer[]>;
export async function getTeamPlayers(
  connection: Connection,
  teamId?: number,
): Promise<TeamPlayer[]> {
  const [result] = await connection.batch(
    [
      teamId === undefined
        ? {
            sql: `
              SELECT
                team_id,
                position,
                previous_position,
                surname,
                name,
                points,
                previous_points
              FROM team_players
              ORDER BY team_id ASC, position ASC
            `,
          }
        : {
            sql: `
              SELECT
                team_id,
                position,
                previous_position,
                surname,
                name,
                points,
                previous_points
              FROM team_players
              WHERE team_id = ?
              ORDER BY position ASC
            `,
            args: [teamId],
          },
    ],
    'read',
  );

  return result.rows as TeamPlayer[];
}
