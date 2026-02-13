import { env } from "@/config/env";

const TOKEN_KEY = "portal_bearer_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || env.bearerToken || null;
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchApi(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // In OIDC mode, ExtAuth handles auth via session cookies.
  // In token mode, send the Bearer token in the Authorization header.
  if (env.oidcEnabled) {
    options.credentials = "include";
  } else {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${env.portalServerUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      if (json.message) message = json.message;
    } catch {
      // keep default message
    }
    throw new ApiError(message, res.status);
  }

  return res;
}

export async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetchApi(path, options);
  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
