import type { Page } from 'puppeteer';

export const FEDERATION_READY_TIMEOUT_MS = 30_000;

export async function waitForFederationReady(
  page: Page,
  pageFunction: () => boolean | Promise<boolean>,
  timeoutMs = FEDERATION_READY_TIMEOUT_MS,
): Promise<void> {
  await page.waitForFunction(pageFunction, { timeout: timeoutMs });
}
