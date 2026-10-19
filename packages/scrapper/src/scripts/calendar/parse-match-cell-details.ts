export interface MatchCellDetails {
  date: string | null;
  location: string | null;
  rounds: string | null;
}

const TANDAS_PREFIX = /^Tandas:\s*/i;

export function parseMatchCellDetails(
  status: string | null,
  lines: string[],
): MatchCellDetails {
  if (lines.length === 0) {
    return { date: null, location: null, rounds: null };
  }

  const tandasLine = lines.find((line) => TANDAS_PREFIX.test(line)) ?? null;
  const isConfirmed = status === 'confecha' || tandasLine !== null;

  if (!isConfirmed) {
    return {
      date: lines.join(' ').trim() || null,
      location: null,
      rounds: null,
    };
  }

  const date = lines[0] ?? null;
  const rounds = tandasLine?.replace(TANDAS_PREFIX, '').trim() || null;
  const location
    = lines.find((line) => line !== date && line !== tandasLine)?.trim()
      || null;

  return { date, location, rounds };
}
