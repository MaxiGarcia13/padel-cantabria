import type { League, RawLeague } from './types.js';
import puppeteer from 'puppeteer';
import { LIGAS_URL } from '@/constants/urls.js';
import { parseSchedule } from './utils.js';

function toLeague(card: RawLeague): League | null {
  if (card.league_id === null || !card.name || !card.schedule) {
    return null;
  }

  return {
    league_id: card.league_id,
    name: card.name,
    schedule: parseSchedule(card.schedule),
  };
}

export async function scrapeLeagues(): Promise<League[]> {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(LIGAS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('article.post');

    const rawCards = await page.evaluate((): RawLeague[] => {
      return Array.from(document.querySelectorAll('article.post')).map(
        (article) => {
          const link = article.querySelector<HTMLAnchorElement>('header h4 a');
          const time = article.querySelector('footer time');
          const href = link?.getAttribute('href') ?? '';
          const idMatch = href.match(/id=(\d+)/);

          return {
            league_id: idMatch ? Number(idMatch[1]) : null,
            name: link?.textContent?.trim() ?? null,
            schedule: time?.textContent?.trim() ?? null,
          };
        },
      );
    });

    return rawCards
      .map(toLeague)
      .filter((league): league is League => league !== null);
  } finally {
    await browser.close();
  }
}
