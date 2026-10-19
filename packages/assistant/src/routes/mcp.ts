import type { FastifyPluginAsync } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { DatabaseClient } from '../db.js';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../mcp/create-mcp-server.js';

interface McpSession {
  server: ReturnType<typeof createMcpServer>;
  transport: StreamableHTTPServerTransport;
}

const sessions = new Map<string, McpSession>();

function isInitializeRequest(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const message = body as { method?: string };
  return message.method === 'initialize';
}

async function handleMcpPost(
  db: DatabaseClient,
  request: {
    headers: Record<string, string | string[] | undefined>;
    raw: IncomingMessage;
    body: unknown;
  },
  reply: {
    raw: ServerResponse;
    status: (code: number) => { send: (payload: unknown) => unknown };
    hijack: () => void;
  },
) {
  const sessionHeader = request.headers['mcp-session-id'];
  const sessionId = Array.isArray(sessionHeader)
    ? sessionHeader[0]
    : sessionHeader;

  if (sessionId) {
    const session = sessions.get(sessionId);

    if (!session) {
      return reply.status(404).send({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Session not found' },
        id: null,
      });
    }

    reply.hijack();
    await session.transport.handleRequest(request.raw, reply.raw, request.body);
    return;
  }

  if (!isInitializeRequest(request.body)) {
    return reply.status(400).send({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Missing mcp-session-id. Send initialize first.',
      },
      id: null,
    });
  }

  const server = createMcpServer(db);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: true,
    onsessioninitialized: (newSessionId) => {
      sessions.set(newSessionId, { server, transport });
    },
  });

  transport.onclose = () => {
    const id = transport.sessionId;
    if (id) {
      sessions.delete(id);
    }
  };

  reply.hijack();
  await server.connect(transport);
  await transport.handleRequest(request.raw, reply.raw, request.body);
}

export function createMcpRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.post('/mcp', async (request, reply) => {
      await handleMcpPost(db, request, reply);
    });

    app.get('/mcp', async (request, reply) => {
      const sessionHeader = request.headers['mcp-session-id'];
      const sessionId = Array.isArray(sessionHeader)
        ? sessionHeader[0]
        : sessionHeader;

      if (!sessionId) {
        return reply.status(405).send({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Method not allowed without mcp-session-id.',
          },
          id: null,
        });
      }

      const session = sessions.get(sessionId);

      if (!session) {
        return reply.status(404).send({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found' },
          id: null,
        });
      }

      reply.hijack();
      await session.transport.handleRequest(request.raw, reply.raw);
    });

    app.delete('/mcp', async (request, reply) => {
      const sessionHeader = request.headers['mcp-session-id'];
      const sessionId = Array.isArray(sessionHeader)
        ? sessionHeader[0]
        : sessionHeader;

      if (!sessionId) {
        return reply.status(400).send({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Missing mcp-session-id' },
          id: null,
        });
      }

      const session = sessions.get(sessionId);

      if (!session) {
        return reply.status(404).send({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found' },
          id: null,
        });
      }

      reply.hijack();
      await session.transport.handleRequest(request.raw, reply.raw);
      sessions.delete(sessionId);
    });
  };
}
