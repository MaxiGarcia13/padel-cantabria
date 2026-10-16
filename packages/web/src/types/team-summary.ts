import type { Match, TeamWithStandings } from '@padel-cantabria/database';

export interface TeamSummaryResponse {
  standing: TeamWithStandings | null;
  nextMatch: Match | null;
}
