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
        position,
        previous_position,
        confrontations_played,
        points,
        matches_played,
        matches_won,
        sets_for,
        sets_against,
        sets_average,
        games_for,
        games_against,
        games_average,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id)
      DO UPDATE SET
        league_id = excluded.league_id,
        gender = excluded.gender,
        category = excluded.category,
        name = excluded.name,
        position = excluded.position,
        previous_position = excluded.previous_position,
        confrontations_played = excluded.confrontations_played,
        points = excluded.points,
        matches_played = excluded.matches_played,
        matches_won = excluded.matches_won,
        sets_for = excluded.sets_for,
        sets_against = excluded.sets_against,
        sets_average = excluded.sets_average,
        games_for = excluded.games_for,
        games_against = excluded.games_against,
        games_average = excluded.games_average,
        updated_at = datetime('now')
    `,
    args: [
      team.id,
      team.league_id,
      team.gender,
      team.category,
      team.name,
      team.position,
      team.previous_position,
      team.confrontations_played,
      team.points,
      team.matches_played,
      team.matches_won,
      team.sets_for,
      team.sets_against,
      team.sets_average,
      team.games_for,
      team.games_against,
      team.games_average,
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
