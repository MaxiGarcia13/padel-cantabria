const API_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid parameters',
  404: 'Not found',
  500: 'Internal server error',
};

export function jsonApiError(status: number, error?: unknown): Response {
  if (error !== undefined) {
    console.error(error);
  }

  const message = API_ERROR_MESSAGES[status] ?? 'Unexpected error';

  return Response.json({ error: message }, { status });
}
