import { scrapeCalendar } from './scrape-calendar.js';

const calendarLeagues = await scrapeCalendar();

console.log(JSON.stringify(calendarLeagues, null, 2));
