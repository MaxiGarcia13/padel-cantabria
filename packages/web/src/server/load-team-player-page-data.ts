import type { Team, WebDatabaseClient } from '@padel-cantabria/database';
import type {
  PlayerCourtAppearance,
} from '@padel-cantabria/shared';
import type {
  PlayerCourtAppearanceWithOpponent,
  TeamPlayerPagePayload,
} from '@/types/team-player-page';
import { computePlayerPageStats } from '@padel-cantabria/shared';

export type {
  PlayerCourtAppearanceWithOpponent,
  TeamPlayerPagePayload,
} from '@/types/team-player-page';

async function resolveOpponentNames(
  db: WebDatabaseClient,
  appearances: PlayerCourtAppearance[],
): Promise<PlayerCourtAppearanceWithOpponent[]> {
  const opponentIds = [
    ...new Set(appearances.map((row) => row.opponent_team_id)),
  ];
  const teams = await Promise.all(
    opponentIds.map((id) => db.getTeamById(id)),
  );
  const nameById = new Map<number, string>();

  for (const [index, id] of opponentIds.entries()) {
    const team = teams[index];

    if (team) {
      nameById.set(id, team.name);
    }
  }

  return appearances.map((row) => ({
    ...row,
    opponent_team_name: nameById.get(row.opponent_team_id) ?? null,
  }));
}

export async function loadTeamPlayerPageData(
  db: WebDatabaseClient,
  team: Team,
  surname: string,
  name: string,
): Promise<TeamPlayerPagePayload | null> {
  const [players, games] = await Promise.all([
    db.getTeamPlayers(team.id),
    db.getMatchGamesByTeamId(team.id),
  ]);

  const player = players.find(
    (row) => row.surname === surname && row.name === name,
  );

  if (!player) {
    return null;
  }

  const stats = computePlayerPageStats(players, games, team.id, player);
  const recentCourts = await resolveOpponentNames(db, stats.recent_courts);

  return {
    team,
    player,
    stats: {
      ...stats,
      recent_courts: recentCourts,
    },
  };
}
