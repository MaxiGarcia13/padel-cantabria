import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { TeamStanding } from '../types/team.js';

function buildUpsertStatement(standing: TeamStanding): BatchStatement {
  return {
    sql: `
      INSERT INTO team_standings (
        league_id,
        gender,
        phase,
        category,
        team_id,
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
      ON CONFLICT(league_id, gender, phase, category, team_id)
      DO UPDATE SET
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
      standing.league_id,
      standing.gender,
      standing.phase,
      standing.category,
      standing.team_id,
      standing.position,
      standing.previous_position,
      standing.confrontations_played,
      standing.points,
      standing.matches_played,
      standing.matches_won,
      standing.sets_for,
      standing.sets_against,
      standing.sets_average,
      standing.games_for,
      standing.games_against,
      standing.games_average,
    ],
  };
}

export async function upsertTeamStandings(
  standings: TeamStanding[],
  connection: Connection,
): Promise<void> {
  if (standings.length === 0) {
    return;
  }

  await connection.pragma('foreign_keys = ON');
  await connection.batch(standings.map(buildUpsertStatement), 'immediate');
}
