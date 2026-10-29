export function toolResult(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data),
      },
    ],
  };
}

export function toolError(
  error: unknown,
  serialize?: (error: unknown) => unknown | undefined,
) {
  const payload = serialize?.(error);

  if (payload !== undefined) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(payload),
        },
      ],
      isError: true,
    };
  }

  const message = error instanceof Error
    ? error.message
    : 'Unknown error';

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
