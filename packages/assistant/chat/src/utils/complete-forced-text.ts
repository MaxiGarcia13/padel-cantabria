import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from './chat-completion-types';
import { withoutSystemMessages } from './chat-message-helpers';

export async function completeForcedText(
  client: ChatCompletionsClient,
  messages: ChatCompletionMessageParam[],
): Promise<string | null> {
  const completion = await client.create({
    messages: withoutSystemMessages(messages),
    tool_choice: 'none',
  });

  return completion.choices[0]?.message?.content?.trim() || null;
}
