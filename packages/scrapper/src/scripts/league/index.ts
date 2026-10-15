import process from 'node:process';
import { upsertCalendarLeagues } from '@padel-cantabria/database';
import { scrapeCalendar } from './scrape-calendar.js';

async function main(): Promise<void> {
  const calendarLeagues = await scrapeCalendar();
  await upsertCalendarLeagues(calendarLeagues);
  console.warn(`Saved ${calendarLeagues.length} league(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
