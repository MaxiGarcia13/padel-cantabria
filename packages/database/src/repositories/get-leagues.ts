import type { BatchStatement, Connection } from '@tursodatabase/serverless';
import type {
  CategoryRecord,
  GenderRecord,
  LeagueRecord,
  PhaseRecord,
} from '../types/db.js';
import type { League } from '../types/league.js';
import { assembleLeagues } from '../adapters/assemble-leagues.js';

export interface GetLeaguesParams {
  leagueIds?: readonly number[] | null;
}

function buildLeagueQueries(
  leagueIds: readonly number[] | null,
): Array<string | BatchStatement> {
  if (!leagueIds) {
    return [
      'SELECT id, name, start_date, end_date FROM leagues ORDER BY start_date DESC',
      'SELECT league_id, value, label FROM genders',
      'SELECT league_id, gender, value, label FROM phases',
      'SELECT league_id, gender, phase, value, label FROM categories',
    ];
  }

  const placeholders = leagueIds.map(() => '?').join(', ');
  const args = [...leagueIds];

  return [
    {
      sql: `SELECT id, name, start_date, end_date FROM leagues WHERE id IN (${placeholders}) ORDER BY start_date DESC`,
      args,
    },
    {
      sql: `SELECT league_id, value, label FROM genders WHERE league_id IN (${placeholders})`,
      args,
    },
    {
      sql: `SELECT league_id, gender, value, label FROM phases WHERE league_id IN (${placeholders})`,
      args,
    },
    {
      sql: `SELECT league_id, gender, phase, value, label FROM categories WHERE league_id IN (${placeholders})`,
      args,
    },
  ];
}

export async function getLeagues(
  connection: Connection,
  params: GetLeaguesParams = {},
): Promise<League[]> {
  const leagueIds = params.leagueIds?.length ? params.leagueIds : null;

  const [leagueResult, genderResult, phaseResult, categoryResult]
    = await connection.batch(buildLeagueQueries(leagueIds), 'read');

  return assembleLeagues({
    leagues: leagueResult.rows as LeagueRecord[],
    genders: genderResult.rows as GenderRecord[],
    phases: phaseResult.rows as PhaseRecord[],
    categories: categoryResult.rows as CategoryRecord[],
  });
}
