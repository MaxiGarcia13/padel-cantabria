import type { MatchGame, MatchResult } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type { ResultCandidate, ScrapedMatchResultPayload } from './types.js';
import { LEAGUE_RESULT_URL } from '@/constants/urls.js';
import { waitForFederationReady } from '@/wait-for-federation-ready.js';
import {
  forEachWithRequestDelay,
  withBrowserPage,
} from '@/with-browser-page.js';
import { parseResultPage } from './parse-result-page.js';

export interface ScrapeResultsResult {
  results: MatchResult[];
  games: MatchGame[];
  scraped: number;
  skipped: number;
}

export async function scrapeResults(
  candidates: ResultCandidate[],
): Promise<ScrapeResultsResult> {
  if (candidates.length === 0) {
    return { results: [], games: [], scraped: 0, skipped: 0 };
  }

  return withBrowserPage(async (page) => {
    const results: MatchResult[] = [];
    const games: MatchGame[] = [];
    let scraped = 0;
    let skipped = 0;

    await forEachWithRequestDelay(candidates, async (candidate) => {
      const payload = await scrapeMatchResult(page, candidate);

      if (!payload) {
        skipped += 1;
        return;
      }

      scraped += 1;
      results.push(payload.result);
      games.push(...payload.games);
    });

    return { results, games, scraped, skipped };
  });
}

async function scrapeMatchResult(
  page: Page,
  candidate: ResultCandidate,
): Promise<ScrapedMatchResultPayload | null> {
  const url = buildResultUrl(candidate);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForResultReady(page);

  return parseResultPage(page, candidate);
}

function buildResultUrl(candidate: ResultCandidate): string {
  const params = new URLSearchParams({
    id: String(candidate.league_id),
    partido: String(candidate.match_id),
    grupo: candidate.category,
  });

  return `${LEAGUE_RESULT_URL}?${params.toString()}`;
}

async function waitForResultReady(page: Page): Promise<void> {
  await waitForFederationReady(page, () => {
    const hasHeading
      = document.body.textContent?.includes('RESULTADO') ?? false;
    const hasTable = Array.from(document.querySelectorAll('table')).some(
      (table) =>
        table.querySelector('tr.fondoFCP')?.textContent?.includes('Jugadores')
        ?? false,
    );

    return hasHeading || hasTable;
  });
}
