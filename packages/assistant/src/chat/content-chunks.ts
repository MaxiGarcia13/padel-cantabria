import type { ChatCompletionChunk } from './complete-chat.js';

export async function* contentChunks(
  text: string,
): AsyncGenerator<ChatCompletionChunk> {
  yield {
    choices: [
      {
        delta: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
  };
}
