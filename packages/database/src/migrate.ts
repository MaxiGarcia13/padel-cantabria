import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createConnection } from './client.js';

function splitSqlStatements(schema: string): string[] {
  return schema
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => {
      if (statement.length === 0) {
        return false;
      }

      const withoutComments = statement
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('--'))
        .join('\n');

      return withoutComments.length > 0;
    });
}

async function migrate(): Promise<void> {
  const schemaPath = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
  const schema = await readFile(schemaPath, 'utf8');
  const statements = splitSqlStatements(schema);

  if (statements.length === 0) {
    console.warn('No schema statements to apply.');
    return;
  }

  const connection = createConnection();

  await connection.batch(statements);

  console.warn(`Applied ${statements.length} schema statement(s).`);
}

migrate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
