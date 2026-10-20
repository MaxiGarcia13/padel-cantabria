export interface SqlFragment {
  sql: string;
  args: string[];
}

// Hyphens → spaces so "D-PRYMAN" still exposes letter token "D".
const NORMALIZED_NAME_SQL
  = `(' ' || REPLACE(REPLACE(LOWER(name), '-', ' '), '/', ' ') || ' ')`;

export function isShortTeamNameToken(token: string): boolean {
  return token.length === 1;
}

export function teamNameTokenClause(token: string): SqlFragment {
  // Whole-word match for A/B/C/E… so "MONTEVERDE E" is not LIKE '%e%'.
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
