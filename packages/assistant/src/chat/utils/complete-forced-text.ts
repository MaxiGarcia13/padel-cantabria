import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from './chat-completion-types.js';
import { looksLikeToolCallLeak } from './looks-like-tool-call-leak.js';

export async function completeForcedText(
  client: ChatCompletionsClient,
  messages: ChatCompletionMessageParam[],
): Promise<string | null> {
  const completion = await client.create({
    messages,
    tool_choice: 'none',
  });

  const content = completion.choices[0]?.message?.content?.trim() || null;
  if (!content || looksLikeToolCallLeak(content)) {
    return null;
  }

  return content;
}
