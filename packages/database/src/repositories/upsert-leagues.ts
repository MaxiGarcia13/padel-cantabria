import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type { League } from '../types/league.js';

function buildUpsertStatements(league: League): BatchStatement[] {
  const statements: BatchStatement[] = [
    {
      sql: `
        INSERT INTO leagues (id, name, start_date, end_date, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          start_date = excluded.start_date,
          end_date = excluded.end_date,
          updated_at = datetime('now')
      `,
      args: [
        league.league_id,
        league.name,
        league.schedule.start_date,
        league.schedule.end_date,
      ],
    },
    {
      sql: 'DELETE FROM genders WHERE league_id = ?',
      args: [league.league_id],
    },
  ];

  for (const gender of league.genders) {
    statements.push({
      sql: 'INSERT INTO genders (league_id, value, label) VALUES (?, ?, ?)',
      args: [league.league_id, gender.value, gender.label],
    });

    for (const phase of gender.phases) {
      statements.push({
        sql: `
          INSERT INTO phases (league_id, gender_value, value, label)
          VALUES (?, ?, ?, ?)
        `,
        args: [league.league_id, gender.value, phase.value, phase.label],
      });

      for (const category of phase.categories) {
        statements.push({
          sql: `
            INSERT INTO categories (
              league_id,
              gender_value,
              phase_value,
              value,
              label
            )
            VALUES (?, ?, ?, ?, ?)
          `,
          args: [
            league.league_id,
            gender.value,
            phase.value,
            category.value,
            category.label,
          ],
        });
      }
    }
  }

  return statements;
}

export async function upsertLeagues(
  leagues: League[],
  connection: Connection,
): Promise<void> {
  await connection.pragma('foreign_keys = ON');

  for (const league of leagues) {
    await connection.batch(buildUpsertStatements(league), 'immediate');
  }
}
