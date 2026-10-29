import type {
  MatchGameForTeam,
  TeamPlayer,
} from '@padel-cantabria/database';
import type { TeamCouplePlayer, TeamCoupleStats } from './compute-team-couple-stats.js';
import {
  computeTeamCoupleStats,

} from './compute-team-couple-stats.js';
import {
  courtOutcome,
  findMatchingPlayer,
  playerKey,
} from './match-scraped-player.js';

const RECENT_COURTS_LIMIT = 12;

export interface PlayerSideSplit {
  games_played: number;
  games_won: number;
  games_lost: number;
}

export interface PlayerPartnerStats {
  partner: TeamCouplePlayer;
  games_played: number;
  games_won: number;
  games_lost: number;
  average: number | null;
}

export interface PlayerCourtAppearance {
  league_id: number;
  gender: string;
  phase: string;
  category: string;
  match_id: number;
  game_number: number;
  date: string | null;
  is_home: boolean;
  opponent_team_id: number;
  partner: TeamCouplePlayer | null;
  outcome: 'won' | 'lost' | null;
  sets_for: number | null;
  sets_against: number | null;
}

export interface PlayerPageStats {
  games_played: number;
  games_won: number;
  games_lost: number;
  average: number | null;
  sets_for: number;
  sets_against: number;
  home: PlayerSideSplit;
  away: PlayerSideSplit;
  partners: PlayerPartnerStats[];
  recent_courts: PlayerCourtAppearance[];
}

function emptySideSplit(): PlayerSideSplit {
  return {
    games_played: 0,
    games_won: 0,
    games_lost: 0,
  };
}

function winAverage(wins: number, losses: number): number | null {
  const decided = wins + losses;

  if (decided === 0) {
    return null;
  }

  return wins / decided;
}

function toCouplePlayer(player: TeamPlayer): TeamCouplePlayer {
  return {
    name: player.name,
    surname: player.surname,
  };
}

function isSamePlayer(
  a: Pick<TeamPlayer, 'surname' | 'name'>,
  b: Pick<TeamPlayer, 'surname' | 'name'>,
): boolean {
  return playerKey(a) === playerKey(b);
}

function partnerFromCouple(
  couple: TeamCoupleStats,
  player: Pick<TeamPlayer, 'surname' | 'name'>,
): TeamCouplePlayer | null {
  if (isSamePlayer(couple.player_1, player)) {
    return couple.player_2;
  }

  if (isSamePlayer(couple.player_2, player)) {
    return couple.player_1;
  }

  return null;
}

function recordOutcome(
  split: PlayerSideSplit,
  outcome: 'won' | 'lost' | null,
): void {
  split.games_played += 1;

  if (outcome === 'won') {
    split.games_won += 1;
  } else if (outcome === 'lost') {
    split.games_lost += 1;
  }
}

export function computePlayerPageStats(
  players: TeamPlayer[],
  games: MatchGameForTeam[],
  teamId: number,
  player: Pick<TeamPlayer, 'surname' | 'name'>,
): PlayerPageStats {
  const targetKey = playerKey(player);
  const home = emptySideSplit();
  const away = emptySideSplit();
  let setsFor = 0;
  let setsAgainst = 0;
  const recentCourts: PlayerCourtAppearance[] = [];

  for (const game of games) {
    const isHome = game.home_team_id === teamId;
    const names = isHome
      ? [game.home_player_1, game.home_player_2]
      : [game.away_player_1, game.away_player_2];
    const matched = names
      .map((scrapedName) => findMatchingPlayer(scrapedName, players))
      .filter((matchedPlayer): matchedPlayer is TeamPlayer => matchedPlayer !== null);

    const matchedSelf = matched.find(
      (matchedPlayer) => playerKey(matchedPlayer) === targetKey,
    );

    if (!matchedSelf) {
      continue;
    }

    const outcome = courtOutcome(game.home_sets, game.away_sets, isHome);
    const sideSplit = isHome ? home : away;
    recordOutcome(sideSplit, outcome);

    const ownSets = isHome ? game.home_sets : game.away_sets;
    const oppSets = isHome ? game.away_sets : game.home_sets;

    if (ownSets != null) {
      setsFor += ownSets;
    }

    if (oppSets != null) {
      setsAgainst += oppSets;
    }

    const partnerPlayer = matched.find(
      (matchedPlayer) => playerKey(matchedPlayer) !== targetKey,
    );

    if (recentCourts.length < RECENT_COURTS_LIMIT) {
      recentCourts.push({
        league_id: game.league_id,
        gender: game.gender,
        phase: game.phase,
        category: game.category,
        match_id: game.match_id,
        game_number: game.game_number,
        date: game.date,
        is_home: isHome,
        opponent_team_id: isHome ? game.away_team_id : game.home_team_id,
        partner: partnerPlayer
          ? toCouplePlayer(partnerPlayer)
          : null,
        outcome,
        sets_for: ownSets,
        sets_against: oppSets,
      });
    }
  }

  const gamesPlayed = home.games_played + away.games_played;
  const gamesWon = home.games_won + away.games_won;
  const gamesLost = home.games_lost + away.games_lost;

  const partners = computeTeamCoupleStats(players, games, teamId)
    .flatMap((couple) => {
      const partner = partnerFromCouple(couple, player);

      if (!partner) {
        return [];
      }

      return [
        {
          partner,
          games_played: couple.games_played,
          games_won: couple.games_won,
          games_lost: couple.games_lost,
          average: couple.average,
        },
      ];
    });

  return {
    games_played: gamesPlayed,
    games_won: gamesWon,
    games_lost: gamesLost,
    average: winAverage(gamesWon, gamesLost),
    sets_for: setsFor,
    sets_against: setsAgainst,
    home,
    away,
    partners,
    recent_courts: recentCourts,
  };
}
