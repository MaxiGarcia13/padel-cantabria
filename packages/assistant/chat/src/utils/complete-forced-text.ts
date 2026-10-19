import type {
  ChatCompletionMessageParam,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import { withoutSystemMessages } from './chat-message-helpers';

export async function completeForcedText(
  engine: MLCEngineInterface,
  messages: ChatCompletionMessageParam[],
): Promise<string | null> {
  const completion = await engine.chat.completions.create({
    messages: withoutSystemMessages(messages),
    tool_choice: 'none' as const,
  });

  return completion.choices[0]?.message?.content?.trim() || null;
}
