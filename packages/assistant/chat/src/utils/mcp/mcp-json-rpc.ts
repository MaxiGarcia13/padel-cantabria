import type { JsonRpcSuccess } from './mcp-parse';
import { asRecord, parseSseJson } from './mcp-parse';

export async function postJsonRpc(
  endpoint: string,
  body: Record<string, unknown>,
  sessionId: string | null,
  options: { allowEmpty?: boolean } = {},
): Promise<{ payload: unknown; sessionId: string | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };

  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const nextSession = response.headers.get('mcp-session-id');
  const resolvedSessionId = nextSession ?? sessionId;

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `MCP HTTP ${response.status}: ${text || response.statusText}`,
    );
  }

  if (!text.trim()) {
    if (options.allowEmpty || response.status === 202) {
      return { payload: null, sessionId: resolvedSessionId };
    }

    throw new Error('Empty MCP response body');
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('text/event-stream')) {
    return {
      payload: parseSseJson(text),
      sessionId: resolvedSessionId,
    };
  }

  return {
    payload: JSON.parse(text) as unknown,
    sessionId: resolvedSessionId,
  };
}

export async function requestJsonRpc(
  endpoint: string,
  method: string,
  params: Record<string, unknown>,
  sessionId: string | null,
  nextId: number,
): Promise<{ result: unknown; sessionId: string | null }> {
  const { payload, sessionId: resolvedSessionId } = await postJsonRpc(
    endpoint,
    {
      jsonrpc: '2.0',
      id: nextId,
      method,
      params,
    },
    sessionId,
  );

  const body = asRecord(payload) as JsonRpcSuccess | null;

  if (!body) {
    throw new Error(`Invalid MCP response for ${method}`);
  }

  if (body.error) {
    throw new Error(body.error.message ?? `MCP error in ${method}`);
  }

  return { result: body.result, sessionId: resolvedSessionId };
}

export async function notifyJsonRpc(
  endpoint: string,
  method: string,
  sessionId: string | null,
): Promise<string | null> {
  const { sessionId: resolvedSessionId } = await postJsonRpc(
    endpoint,
    { jsonrpc: '2.0', method },
    sessionId,
    { allowEmpty: true },
  );

  return resolvedSessionId;
}
