import { HttpError, httpErrorPayload } from '../errors.js';

export function toolResult(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function toolError(error: unknown) {
  if (error instanceof HttpError) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(httpErrorPayload(error), null, 2),
        },
      ],
      isError: true,
    };
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  return {
    content: [
      {
        type: 'text' as const,
        text: message,
      },
    ],
    isError: true,
  };
}
