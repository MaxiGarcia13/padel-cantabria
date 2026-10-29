import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { TeamPlayer } from '../types/team-player.js';

function playerKey(player: Pick<TeamPlayer, 'surname' | 'name'>): string {
  return `${player.surname}\0${player.name}`;
}

function buildUpsertStatement(player: TeamPlayer): BatchStatement {
  return {
    sql: `
      INSERT INTO team_players (
        team_id,
        position,
        previous_position,
        surname,
        name,
        points,
        previous_points,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(team_id, surname, name)
      DO UPDATE SET
        position = excluded.position,
        previous_position = excluded.previous_position,
        points = excluded.points,
        previous_points = excluded.previous_points,
        updated_at = datetime('now')
    `,
    args: [
      player.team_id,
      player.position,
      player.previous_position,
      player.surname,
      player.name,
      player.points,
      player.previous_points,
    ],
  };
}

function buildDeleteOrphansStatement(
  teamId: number,
  players: TeamPlayer[],
): BatchStatement {
  const placeholders = players.map(() => '(?, ?)').join(', ');

  return {
    sql: `
      DELETE FROM team_players
      WHERE team_id = ?
        AND (surname, name) NOT IN (${placeholders})
    `,
    args: [
      teamId,
      ...players.flatMap((player) => [player.surname, player.name]),
    ],
  };
}

export async function upsertTeamPlayers(
  players: TeamPlayer[],
  connection: Connection,
): Promise<void> {
  if (players.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');

  const playersByTeam = new Map<number, TeamPlayer[]>();

  for (const player of players) {
    const teamPlayers = playersByTeam.get(player.team_id);

    if (teamPlayers) {
      teamPlayers.push(player);
    } else {
      playersByTeam.set(player.team_id, [player]);
    }
  }

  const statements: BatchStatement[] = players.map(buildUpsertStatement);

  for (const [teamId, teamPlayers] of playersByTeam) {
    const uniquePlayers = [
      ...new Map(
        teamPlayers.map((player) => [
          playerKey(player),
          player,
        ]),
      ).values(),
    ];

    statements.push(buildDeleteOrphansStatement(teamId, uniquePlayers));
  }

  await connection.batch(statements, 'write');
}
