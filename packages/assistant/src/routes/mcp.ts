import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseClient } from '../db.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../mcp/create-mcp-server.js';

async function handleMcpRequest(
  db: DatabaseClient,
  request: { raw: import('node:http').IncomingMessage; body: unknown },
  reply: {
    raw: import('node:http').ServerResponse;
    hijack: () => void;
  },
) {
  const server = createMcpServer(db);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  reply.raw.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(request.raw, reply.raw, request.body);
  reply.hijack();
}

export function createMcpRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.post('/mcp', async (request, reply) => {
      await handleMcpRequest(db, request, reply);
    });

    app.get('/mcp', async (_request, reply) => {
      return reply.status(405).send({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed. Use POST for Streamable HTTP MCP.',
        },
        id: null,
      });
    });

    app.delete('/mcp', async (_request, reply) => {
      return reply.status(405).send({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed in stateless mode.',
        },
        id: null,
      });
    });
  };
}
