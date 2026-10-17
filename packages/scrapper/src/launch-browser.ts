import type { Browser } from 'puppeteer';
import process from 'node:process';
import puppeteer from 'puppeteer';

export function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined,
  });
}
