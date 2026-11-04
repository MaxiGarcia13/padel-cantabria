import type { CallTool } from '@chat/call-tool.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from '@chat/utils/chat-completion-types.js';
import {
  formatToolResult,
  parseToolArguments,
} from '@chat/utils/chat-message-helpers.js';
import { sanitizeToolArgs } from './sanitize-tool-args.js';

export async function executeToolCalls(options: {
  callTool: CallTool;
  toolCalls: ChatCompletionMessageToolCall[];
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<void> {
  for (const toolCall of options.toolCalls) {
    const name = toolCall.function.name;
    const args = sanitizeToolArgs(
      parseToolArguments(toolCall.function.arguments),
    );
    const toolText = await options.callTool(name, args);
    options.toolResults.push(toolText);

    options.messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: formatToolResult(name, toolText),
    });
  }
}
