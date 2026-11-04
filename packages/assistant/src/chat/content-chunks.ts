import type { writeNdjsonStream } from '@maxigarcia/ai-router';

type NdjsonChunk = Parameters<typeof writeNdjsonStream>[0] extends
AsyncIterable<infer Chunk>
  ? Chunk
  : never;

export async function* contentChunks(
  text: string,
): AsyncGenerator<NdjsonChunk> {
  yield {
    id: 'content',
    object: 'chat.completion.chunk',
    created: 0,
    model: '',
    choices: [
      {
        index: 0,
        delta: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      },
    ],
  };
}
