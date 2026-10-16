import type { CategoryKey, Team, TeamStanding } from '@padel-cantabria/database';
import type { ScrapedTeamStanding } from './types.js';
import { EMPTY_TEAM_STANDINGS } from '@padel-cantabria/database';
import { teamStandingKey } from './team-standing-key.js';

export function mergeTeamStandings(
  teams: Team[],
  category: CategoryKey,
  scrapedStandings: ScrapedTeamStanding[],
  previousPositions: Map<string, number | null>,
): TeamStanding[] {
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
      const previous_position
        = previousPositions.get(teamStandingKey(category, team.id)) ?? null;

      if (!scraped) {
        return {
          league_id: category.league_id,
          gender: category.gender,
          phase: category.phase,
          category: category.category,
          team_id: team.id,
          ...EMPTY_TEAM_STANDINGS,
          previous_position,
        };
      }

      return {
        league_id: category.league_id,
        gender: category.gender,
        phase: category.phase,
        category: category.category,
        team_id: team.id,
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
