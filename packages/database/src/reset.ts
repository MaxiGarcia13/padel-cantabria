import process from 'node:process';
import { createConnection } from './client/index.js';
import { loadSchemaStatements } from './load-schema-statements.js';

const DROP_TABLES = [
  'matches',
  'team_standings',
  'teams',
  'categories',
  'phases',
  'genders',
  'leagues',
] as const;

async function reset(): Promise<void> {
  const statements = await loadSchemaStatements();

  if (statements.length === 0) {
    console.warn('No schema statements to apply.');
    return;
  }

  const connection = createConnection({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  await connection.pragma('foreign_keys = OFF');
  await connection.batch(
    DROP_TABLES.map((table) => `DROP TABLE IF EXISTS ${table}`),
    'write',
  );
  await connection.pragma('foreign_keys = ON');
  await connection.batch(statements);

  console.warn(
    `Reset database: dropped ${DROP_TABLES.length} table(s), applied ${statements.length} schema statement(s).`,
  );
}

reset().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
