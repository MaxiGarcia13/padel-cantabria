import type { Connection } from '@tursodatabase/serverless';
import process from 'node:process';
import { connect } from '@tursodatabase/serverless';

export function createConnection(): Connection {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  }

  return connect({ url, authToken });
}
