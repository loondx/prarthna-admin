'use client';

/**
 * Central typed API client for the NestJS backend.
 * - Base URL from NEXT_PUBLIC_API_URL (falls back to local dev API).
 * - Attaches the admin JWT from the session cookie on every request.
 * - Normalises errors into ApiError with the backend's message.
 * - On 401 the session cookie is cleared and the user is sent to /login.
 */

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const API_BASE = `${RAW_BASE.replace(/\/$/, '')}/api/v1`;
export const MEDIA_BASE = RAW_BASE.replace(/\/$/, '');

const COOKIE_NAME = 'prarthna_admin_token';

export function getAdminToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function handleUnauthorized() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(opts.body && !(opts.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opts.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Session expired — please sign in again');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? message);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string) => api<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const apiPut = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' });

/** Multipart upload (audio files). Do not set Content-Type — the browser does. */
export const apiUpload = <T>(path: string, form: FormData) =>
  api<T>(path, { method: 'POST', body: form });
