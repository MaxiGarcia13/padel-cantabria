import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function splitSqlStatements(schema: string): string[] {
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

export async function loadSchemaStatements(): Promise<string[]> {
  const schemaPath = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
  const schema = await readFile(schemaPath, 'utf8');

  return splitSqlStatements(schema);
}
