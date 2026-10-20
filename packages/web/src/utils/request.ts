export interface Request {
  json: <T>(errorMessage: string) => Promise<T>;
}

type FetchParameters = Parameters<typeof fetch>;

export function request(...params: FetchParameters): Request {
  return {
    json<T>(errorMessage: string): Promise<T> {
      return json<T>(errorMessage, ...params);
    },
  };
}

async function json<T>(errorMessage: string, ...params: FetchParameters): Promise<T> {
  const response = await fetch(...params);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? errorMessage);
  }

  return response.json() as Promise<T>;
};
