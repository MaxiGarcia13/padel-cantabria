import type { TursoConfig } from './connection.js';
import process from 'node:process';
import { createMcpClient } from './create-mcp-client.js';
import { createScraperClient } from './create-scraper-client.js';
import { createWebClient } from './create-web-client.js';

function tursoConfigFromEnv(): TursoConfig {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  }

  return { url, authToken };
}

export function createWebClientFromEnv() {
  return createWebClient(tursoConfigFromEnv());
}

export function createMcpClientFromEnv() {
  return createMcpClient(tursoConfigFromEnv());
}

export function createScraperClientFromEnv() {
  return createScraperClient(tursoConfigFromEnv());
}
