import { joinAndFilters } from './join-and-filters.js';

export interface ListScopeParams {
  leagueIds?: readonly number[] | null;
  genders?: readonly string[] | null;
}

export function buildListScopeFilter(
  params: ListScopeParams,
  columns: {
    leagueId?: string;
    gender?: string;
  } = {},
): { sql: string; args: Array<number | string> } {
  const leagueColumn = columns.leagueId ?? 'league_id';
  const genderColumn = columns.gender ?? 'gender';
  const leagueIds = params.leagueIds?.length ? params.leagueIds : null;
  const genders = params.genders?.length ? params.genders : null;

  const filters: string[] = [];
  const args: Array<number | string> = [];

  if (leagueIds) {
    filters.push(
      `${leagueColumn} IN (${leagueIds.map(() => '?').join(', ')})`,
    );
    args.push(...leagueIds);
  }

  if (genders) {
    filters.push(
      `${genderColumn} IN (${genders.map(() => '?').join(', ')})`,
    );
    args.push(...genders);
  }

  return {
    sql: joinAndFilters(filters),
    args,
  };
}
