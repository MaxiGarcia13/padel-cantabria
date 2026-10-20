import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';

export function getDb() {
  return createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
}
