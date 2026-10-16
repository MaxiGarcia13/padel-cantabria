import type { CategoryKey, Team } from '@padel-cantabria/database';
import type { ScrapedTeamStanding } from './types.js';
import { EMPTY_TEAM_STANDINGS } from '@padel-cantabria/database';

export function mergeTeamStandings(
  teams: Team[],
  category: CategoryKey,
  scrapedStandings: ScrapedTeamStanding[],
): Team[] {
  const standingsById = new Map(
    scrapedStandings.map((standing) => [standing.id, standing]),
  );

  return teams
    .filter(
      (team) =>
        team.league_id === category.league_id
        && team.gender === category.gender
        && team.category === category.category,
    )
    .map((team) => {
      const scraped = standingsById.get(team.id);
      const previous_position = team.position;

      if (!scraped) {
        return {
          ...team,
          ...EMPTY_TEAM_STANDINGS,
          previous_position,
        };
      }

      return {
        ...team,
        previous_position,
        position: scraped.position,
        confrontations_played: scraped.confrontations_played,
        points: scraped.points,
        matches_played: scraped.matches_played,
        matches_won: scraped.matches_won,
        sets_for: scraped.sets_for,
        sets_against: scraped.sets_against,
        sets_average: scraped.sets_average,
        games_for: scraped.games_for,
        games_against: scraped.games_against,
        games_average: scraped.games_average,
      };
    });
}
