import type { Connection } from '@tursodatabase/serverless';
import type {
  CategoryRecord,
  GenderRecord,
  LeagueRecord,
  PhaseRecord,
} from '../types/db.js';
import type { League } from '../types/league.js';
import { assembleLeagues } from '../adapters/assemble-leagues.js';

export async function getLeagues(connection: Connection): Promise<League[]> {
  const [leagueResult, genderResult, phaseResult, categoryResult]
    = await connection.batch(
      [
        'SELECT id, name, start_date, end_date FROM leagues ORDER BY start_date DESC',
        'SELECT league_id, value, label FROM genders',
        'SELECT league_id, gender_value, value, label FROM phases',
        'SELECT league_id, gender_value, phase_value, value, label FROM categories',
      ],
      'read',
    );

  return assembleLeagues({
    leagues: leagueResult.rows as LeagueRecord[],
    genders: genderResult.rows as GenderRecord[],
    phases: phaseResult.rows as PhaseRecord[],
    categories: categoryResult.rows as CategoryRecord[],
  });
}
