import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { PendingClarification } from './domain/clarification.js';
import type { ChatCompletionMessageParam } from './utils/chat-completion-types.js';
import { createMcpHandlers } from '../mcp/create-mcp-handlers.js';
import { createCallTool } from './call-tool.js';
import { chatCompletionsClient } from './complete-chat.js';
import { resolveUserMessage } from './domain/resolve-user-message.js';
import { mcpToolsAsOpenAi } from './mcp-tools-as-openai.js';

export interface ChatTurnRequest {
  userMessage: string;
  history?: ChatCompletionMessageParam[];
  pending?: PendingClarification | null;
}

export async function runChatTurnRequest(
  db: McpDatabaseClient,
  body: ChatTurnRequest,
) {
  const callTool = createCallTool(createMcpHandlers(db));

  return resolveUserMessage({
    client: chatCompletionsClient,
    callTool,
    tools: mcpToolsAsOpenAi(),
    history: body.history ?? [],
    pending: body.pending ?? null,
    userMessage: body.userMessage,
  });
}
