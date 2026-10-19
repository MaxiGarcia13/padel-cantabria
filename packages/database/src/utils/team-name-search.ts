/**
 * SQL fragments for team name search.
 * Single-character tokens (A/B/C/E…, 4) match as whole name words so
 * "MONTEVERDE E" does not become LIKE '%e%' against every Monteverde team.
 */

export interface SqlFragment {
  sql: string;
  args: string[];
}

/** Normalize hyphens so "D-PRYMAN" still exposes letter token "D". */
const NORMALIZED_NAME_SQL
  = `(' ' || REPLACE(REPLACE(LOWER(name), '-', ' '), '/', ' ') || ' ')`;

export function isShortTeamNameToken(token: string): boolean {
  return token.length === 1;
}

export function teamNameTokenClause(token: string): SqlFragment {
  if (isShortTeamNameToken(token)) {
    return {
      sql: `${NORMALIZED_NAME_SQL} LIKE '% ' || LOWER(?) || ' %'`,
      args: [token],
    };
  }

  return {
    sql: `LOWER(name) LIKE '%' || LOWER(?) || '%'`,
    args: [token],
  };
}

/** Prefer exact / prefix matches for the full query string. */
export function teamNameRelevanceOrder(query: string): SqlFragment {
  const trimmed = query.trim();
  if (!trimmed) {
    return { sql: 'name', args: [] };
  }

  return {
    sql: `
      CASE
        WHEN LOWER(name) = LOWER(?) THEN 0
        WHEN LOWER(name) LIKE LOWER(?) || ' %' THEN 1
        WHEN LOWER(name) LIKE LOWER(?) || '%' THEN 2
        ELSE 3
      END,
      name
    `,
    args: [trimmed, trimmed, trimmed],
  };
}
