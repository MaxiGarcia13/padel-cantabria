import { resolve } from 'node:path';
import process, { loadEnvFile } from 'node:process';
import {
  createMcpClientFromEnv,
  getConfiguredLeagueId,
} from '@padel-cantabria/database';
import { createApp } from './create-app.js';

const DEFAULT_PORT = 3001;
const ROOT_ENV_PATH = resolve(import.meta.dirname, '../../../.env');

try {
  loadEnvFile(ROOT_ENV_PATH);
} catch {
  // Production hosts inject env vars; local .env is optional.
}

async function main() {
  const port
    = Number(process.env.ASSISTANT_PORT ?? process.env.PORT) || DEFAULT_PORT;
  const host
    = process.env.ASSISTANT_HOST
      ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
  const leagueId = getConfiguredLeagueId();

  const db = createMcpClientFromEnv();
  const app = await createApp(db);

  await app.listen({ port, host });
  app.log.info(`Assistant ready at http://${host}:${port}/ (league ${leagueId})`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
