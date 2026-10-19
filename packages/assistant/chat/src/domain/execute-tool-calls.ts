import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from '../utils/chat-completion-types';
import type { McpBrowserClient } from '../utils/mcp-client';
import {
  formatToolResult,
  parseToolArguments,
} from '../utils/chat-message-helpers';
import { sanitizeToolArgs } from './sanitize-tool-args';

export async function executeToolCalls(options: {
  mcp: McpBrowserClient;
  toolCalls: ChatCompletionMessageToolCall[];
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<void> {
  for (const toolCall of options.toolCalls) {
    const name = toolCall.function.name;
    const args = sanitizeToolArgs(
      parseToolArguments(toolCall.function.arguments),
    );
    const toolText = await options.mcp.callTool(name, args);
    options.toolResults.push(toolText);

    options.messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: formatToolResult(name, toolText),
    });
  }
}

export function toolCallsIncludeListTeams(
  toolCalls: ChatCompletionMessageToolCall[],
): boolean {
  return toolCalls.some((toolCall) => toolCall.function.name === 'list_teams');
}
