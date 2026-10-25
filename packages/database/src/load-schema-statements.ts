import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA_FILES = [
  'leagues.sql',
  'teams.sql',
  'matches.sql',
  'match-results.sql',
] as const;

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
  const schemaDir = join(dirname(fileURLToPath(import.meta.url)), 'schema');
  const files = await Promise.all(
    SCHEMA_FILES.map((fileName) =>
      readFile(join(schemaDir, fileName), 'utf8'),
    ),
  );

  return [
    'PRAGMA foreign_keys = ON',
    ...files.flatMap((schema) => splitSqlStatements(schema)),
  ];
}
