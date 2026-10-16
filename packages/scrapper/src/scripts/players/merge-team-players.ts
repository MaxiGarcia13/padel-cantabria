import type { TeamPlayer } from '@padel-cantabria/database';
import type { ScrapedPlayer } from './types.js';
import { playerKey } from './player-key.js';

export function mergeTeamPlayers(
  teamId: number,
  scrapedPlayers: ScrapedPlayer[],
  previousByKey: Map<string, Pick<TeamPlayer, 'position' | 'points'>>,
): TeamPlayer[] {
  return scrapedPlayers.map((scraped) => {
    const previous = previousByKey.get(
      playerKey(teamId, scraped.surname, scraped.name),
    );

    return {
      team_id: teamId,
      position: scraped.position,
      previous_position: previous?.position ?? null,
      surname: scraped.surname,
      name: scraped.name,
      points: scraped.points,
      previous_points: previous?.points ?? null,
    };
  });
}
