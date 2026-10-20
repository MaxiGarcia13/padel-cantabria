import process from 'node:process';
import { createClient } from './client.js';

export function createClientFromEnv() {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  }

  return createClient({ url, authToken });
}
