import { API_BASE_URL } from '../config/api';

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...headers,
      ...(init?.headers ?? {})
    },
    ...init
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpError(payload?.message ?? 'Request failed', response.status);
  }

  return payload as T;
}

let authToken: string | null = null;

export function setAuthToken(nextToken: string | null) {
  authToken = nextToken;
}

export function getAuthToken() {
  return authToken;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
};

export { HttpError };
