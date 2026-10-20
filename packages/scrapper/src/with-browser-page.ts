import type { Page } from 'puppeteer';
import { delayBetweenRequests } from './delay.js';
import { launchBrowser } from './launch-browser.js';

export async function withBrowserPage<T>(
  run: (page: Page) => Promise<T>,
): Promise<T> {
  const browser = await launchBrowser();

  try {
    return await run(await browser.newPage());
  } finally {
    await browser.close();
  }
}

export async function forEachWithRequestDelay<T>(
  items: readonly T[],
  run: (item: T, index: number) => Promise<void>,
): Promise<void> {
  for (const [index, item] of items.entries()) {
    if (index > 0) {
      await delayBetweenRequests();
    }

    await run(item, index);
  }
}
