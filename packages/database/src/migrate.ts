import process from 'node:process';
import { createConnection } from './client.js';
import { loadSchemaStatements } from './load-schema-statements.js';

async function migrate(): Promise<void> {
  const statements = await loadSchemaStatements();

  if (statements.length === 0) {
    console.warn('No schema statements to apply.');
    return;
  }

  const connection = createConnection({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  await connection.batch(statements);

  console.warn(`Applied ${statements.length} schema statement(s).`);
}

migrate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
