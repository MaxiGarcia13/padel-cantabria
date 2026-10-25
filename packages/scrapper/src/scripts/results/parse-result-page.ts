import type { MatchGame, MatchResult } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type {
  RawResultPage,
  ResultCandidate,
  ScrapedMatchResultPayload,
} from './types.js';
import { parseFederationInteger } from './parse-federation-integer.js';

function trimText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';

  return trimmed.length > 0 ? trimmed : null;
}

function isCompleteGame(game: {
  game_number: number | null;
  home_player_1: string | null;
  home_player_2: string | null;
  away_player_1: string | null;
  away_player_2: string | null;
}): boolean {
  return (
    game.game_number !== null
    && Boolean(game.home_player_1)
    && Boolean(game.home_player_2)
    && Boolean(game.away_player_1)
    && Boolean(game.away_player_2)
  );
}

function hasUsableScore(raw: RawResultPage): boolean {
  return (
    parseFederationInteger(raw.home_sets) !== null
    || parseFederationInteger(raw.away_sets) !== null
    || parseFederationInteger(raw.home_games) !== null
    || parseFederationInteger(raw.away_games) !== null
  );
}

export async function parseResultPage(
  page: Page,
  candidate: ResultCandidate,
): Promise<ScrapedMatchResultPayload | null> {
  const raw = await page.evaluate((): RawResultPage | null => {
    const fieldBlocks = Array.from(
      document.querySelectorAll('.row.mBtm-20 .centrado'),
    );
    const fieldsByLabel = new Map<string, string>();

    for (const block of fieldBlocks) {
      const label = (block.childNodes[0]?.textContent ?? '').trim();
      const value = block.querySelector('input')?.value?.trim() || null;

      if (label.length > 0 && value && !fieldsByLabel.has(label)) {
        fieldsByLabel.set(label, value);
      }
    }

    const scoreRow = Array.from(document.querySelectorAll('.row.mBtm-20')).find(
      (row) => {
        const labels = Array.from(row.querySelectorAll('.centrado')).map(
          (block) => (block.childNodes[0]?.textContent ?? '').trim(),
        );

        return (
          labels.filter((label) => label === 'Juegos Ganados').length === 2
          && labels.filter((label) => label === 'Sets Ganados').length === 2
        );
      },
    );
    const scoreInputs = scoreRow
      ? Array.from(scoreRow.querySelectorAll('input'))
      : [];

    const table = Array.from(document.querySelectorAll('table')).find(
      (candidateTable) =>
        candidateTable
          .querySelector('tr.fondoFCP')
          ?.textContent
          ?.includes('Jugadores') ?? false,
    );

    if (!table) {
      return null;
    }

    const rows = Array.from(table.querySelectorAll('tr.lineas'));
    const games = [];
    let index = 0;

    while (index < rows.length) {
      const firstCells = Array.from(rows[index]!.querySelectorAll('td'));

      if (firstCells.length < 10) {
        index += 1;
        continue;
      }

      const secondCells = Array.from(
        rows[index + 1]?.querySelectorAll('td') ?? [],
      );

      if (secondCells.length < 4) {
        index += 1;
        continue;
      }

      games.push({
        game_number: firstCells[0]?.textContent?.trim() || null,
        home_pair_points: firstCells[1]?.textContent?.trim() || null,
        home_player_1_points: firstCells[2]?.textContent?.trim() || null,
        home_player_1: firstCells[3]?.textContent?.trim() || null,
        home_sets: firstCells[4]?.textContent?.trim() || null,
        partials: firstCells[5]?.textContent?.trim() || null,
        away_sets: firstCells[6]?.textContent?.trim() || null,
        away_player_1: firstCells[7]?.textContent?.trim() || null,
        away_player_1_points: firstCells[8]?.textContent?.trim() || null,
        away_pair_points: firstCells[9]?.textContent?.trim() || null,
        home_player_2_points: secondCells[0]?.textContent?.trim() || null,
        home_player_2: secondCells[1]?.textContent?.trim() || null,
        away_player_2: secondCells[2]?.textContent?.trim() || null,
        away_player_2_points: secondCells[3]?.textContent?.trim() || null,
      });

      index += 2;
    }

    return {
      round: fieldsByLabel.get('Jornada') ?? null,
      played_at: fieldsByLabel.get('Fecha eliminatoria') ?? null,
      location: fieldsByLabel.get('Lugar') ?? null,
      rounds_order: fieldsByLabel.get('Orden de las tandas') ?? null,
      home_games: scoreInputs[0]?.value?.trim() || null,
      home_sets: scoreInputs[1]?.value?.trim() || null,
      home_matches: scoreInputs[2]?.value?.trim() || null,
      away_matches: scoreInputs[3]?.value?.trim() || null,
      away_sets: scoreInputs[4]?.value?.trim() || null,
      away_games: scoreInputs[5]?.value?.trim() || null,
      games,
    };
  });

  if (!raw || raw.games.length === 0 || !hasUsableScore(raw)) {
    return null;
  }

  const parsedGames = raw.games.flatMap((game) => {
    const gameNumber = parseFederationInteger(game.game_number);
    const homePlayer1 = trimText(game.home_player_1);
    const homePlayer2 = trimText(game.home_player_2);
    const awayPlayer1 = trimText(game.away_player_1);
    const awayPlayer2 = trimText(game.away_player_2);

    if (
      !isCompleteGame({
        game_number: gameNumber,
        home_player_1: homePlayer1,
        home_player_2: homePlayer2,
        away_player_1: awayPlayer1,
        away_player_2: awayPlayer2,
      })
      || gameNumber === null
      || !homePlayer1
      || !homePlayer2
      || !awayPlayer1
      || !awayPlayer2
    ) {
      return [];
    }

    const matchGame: MatchGame = {
      league_id: candidate.league_id,
      gender: candidate.gender,
      phase: candidate.phase,
      category: candidate.category,
      match_id: candidate.match_id,
      game_number: gameNumber,
      home_pair_points: parseFederationInteger(game.home_pair_points),
      away_pair_points: parseFederationInteger(game.away_pair_points),
      home_sets: parseFederationInteger(game.home_sets),
      away_sets: parseFederationInteger(game.away_sets),
      partials: trimText(game.partials),
      home_player_1: homePlayer1,
      home_player_1_points: parseFederationInteger(game.home_player_1_points),
      home_player_2: homePlayer2,
      home_player_2_points: parseFederationInteger(game.home_player_2_points),
      away_player_1: awayPlayer1,
      away_player_1_points: parseFederationInteger(game.away_player_1_points),
      away_player_2: awayPlayer2,
      away_player_2_points: parseFederationInteger(game.away_player_2_points),
    };

    return [matchGame];
  });

  if (parsedGames.length === 0) {
    return null;
  }

  const result: MatchResult = {
    league_id: candidate.league_id,
    gender: candidate.gender,
    phase: candidate.phase,
    category: candidate.category,
    match_id: candidate.match_id,
    round: parseFederationInteger(raw.round),
    played_at: trimText(raw.played_at),
    location: trimText(raw.location),
    rounds_order: trimText(raw.rounds_order),
    home_games: parseFederationInteger(raw.home_games),
    home_sets: parseFederationInteger(raw.home_sets),
    home_matches: parseFederationInteger(raw.home_matches),
    away_matches: parseFederationInteger(raw.away_matches),
    away_sets: parseFederationInteger(raw.away_sets),
    away_games: parseFederationInteger(raw.away_games),
  };

  return { result, games: parsedGames };
}
