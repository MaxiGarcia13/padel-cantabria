import process from 'node:process';
import { createApp } from './create-app.js';
import { createDatabaseClient } from './db.js';

const DEFAULT_PORT = 3001;

async function main() {
  const port = Number(process.env.ASSISTANT_PORT) || DEFAULT_PORT;
  const host = process.env.ASSISTANT_HOST ?? '0.0.0.0';

  const db = createDatabaseClient();
  const app = await createApp(db);

  await app.listen({ port, host });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
