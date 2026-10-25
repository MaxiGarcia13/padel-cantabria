import { createWebClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';

export function getDb() {
  return createWebClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
}
