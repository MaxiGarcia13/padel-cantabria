import { scrapeLeagues } from './scrape.js';

const leagues = await scrapeLeagues();

console.log(JSON.stringify(leagues, null, 2));
