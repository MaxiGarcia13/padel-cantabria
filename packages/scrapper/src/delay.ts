import process from 'node:process';

const DEFAULT_SCRAPE_DELAY_MS = 1500;

export function getScrapeDelayMs(): number {
  const raw = process.env.SCRAPE_DELAY_MS?.trim();

  if (!raw) {
    return DEFAULT_SCRAPE_DELAY_MS;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `Invalid SCRAPE_DELAY_MS: "${raw}". Expected a non-negative number.`,
    );
  }

  return parsed;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function delayBetweenRequests(): Promise<void> {
  return delay(getScrapeDelayMs());
}
