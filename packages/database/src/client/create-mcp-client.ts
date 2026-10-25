import type { TursoConfig } from './connection.js';
import { createConnection } from './connection.js';
import { createMcpReads } from './mcp-reads.js';
import { createSharedReads } from './shared-reads.js';

export function createMcpClient(params: TursoConfig) {
  const connection = createConnection(params);

  return {
    ...createSharedReads(connection),
    ...createMcpReads(connection),
  };
}

export type McpDatabaseClient = ReturnType<typeof createMcpClient>;
