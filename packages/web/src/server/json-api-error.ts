const API_ERROR_MESSAGES: Record<number, string> = {
  400: 'Parámetros inválidos',
  500: 'Error interno del servidor',
};

export function jsonApiError(status: number, error?: unknown): Response {
  if (error !== undefined) {
    console.error(error);
  }

  const message = API_ERROR_MESSAGES[status] ?? 'Error inesperado';

  return Response.json({ error: message }, { status });
}
