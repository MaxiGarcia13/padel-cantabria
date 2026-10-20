import { HttpError, httpErrorPayload } from '../errors.js';

export function serializeToolError(error: unknown): unknown | undefined {
  if (error instanceof HttpError) {
    return httpErrorPayload(error);
  }

  return undefined;
}
