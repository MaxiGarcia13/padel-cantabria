import type { McpDatabaseClient } from '@padel-cantabria/database';
import { badRequest, notFound } from '../errors.js';
import {
  presentRosterTotals,
  presentTeamPlayers,
} from '../presenters/present-player.js';
import { presentTeam } from '../presenters/present-team.js';

export async function listTeamPlayersHandler(
  db: McpDatabaseClient,
  teamId: number,
) {
  if (!Number.isFinite(teamId) || teamId <= 0) {
    throw badRequest('Invalid team id');
  }

  const team = await db.getTeamById(teamId);

  if (!team) {
    throw notFound(`Team not found: ${teamId}`);
  }

  const [players, leagues] = await Promise.all([
    db.getTeamPlayers(team.id),
    db.getLeagues(),
  ]);

  return {
    team: presentTeam(team, leagues),
    players: presentTeamPlayers(players),
    totals: presentRosterTotals(players),
  };
}
