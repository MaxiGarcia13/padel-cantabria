export type HttpErrorDetails = Record<string, unknown>;

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: HttpErrorDetails;

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; details?: HttpErrorDetails } = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export function badRequest(
  message: string,
  options: { code?: string; details?: HttpErrorDetails } = {},
): HttpError {
  return new HttpError(400, message, options);
}

export function notFound(
  message: string,
  options: { code?: string; details?: HttpErrorDetails } = {},
): HttpError {
  return new HttpError(404, message, options);
}

/** JSON body for HTTP clients and MCP tool errors. */
export function httpErrorPayload(error: HttpError) {
  return {
    error: error.message,
    ...(error.code ? { code: error.code } : {}),
    ...(error.details ?? {}),
  };
}
