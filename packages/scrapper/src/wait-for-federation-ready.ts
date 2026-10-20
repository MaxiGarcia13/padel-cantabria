import type { Page } from 'puppeteer';

export const FEDERATION_READY_TIMEOUT_MS = 30_000;

export async function waitForFederationReady(
  page: Page,
  isContentReady: () => boolean | Promise<boolean>,
  timeoutMs = FEDERATION_READY_TIMEOUT_MS,
): Promise<void> {
  await page.waitForFunction(
    () => {
      const mandando = document.getElementById('mandando');
      return !(mandando && mandando.style.display !== 'none');
    },
    { timeout: timeoutMs },
  );

  await page.waitForFunction(isContentReady, { timeout: timeoutMs });
}
