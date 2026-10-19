import process from 'node:process';
import { getConfiguredLeagueId } from './config/parse-league-ids.js';
import { createApp } from './create-app.js';
import { createDatabaseClient } from './db.js';

const DEFAULT_PORT = 3001;

async function main() {
  const port = Number(process.env.ASSISTANT_PORT) || DEFAULT_PORT;
  const host = process.env.ASSISTANT_HOST ?? 'localhost';
  const leagueId = getConfiguredLeagueId();

  const db = createDatabaseClient();
  const app = await createApp(db);

  await app.listen({ port, host });
  app.log.info(`Assistant ready at http://localhost:${port}/ (league ${leagueId})`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
