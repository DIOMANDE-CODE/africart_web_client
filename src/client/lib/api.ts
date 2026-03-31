/**
 * Centralised Axios instance.
 * All API calls must go through this client so that
 * base-URL, credentials and headers are set once.
 */
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required for HttpOnly cookie auth
  headers: { "Content-Type": "application/json" },
});

export interface ParsedApiError {
  status: number;
  message: string;
  code?: string | number | null;
  details?: unknown;
}

export function parseApiError(err: unknown): ParsedApiError {
  let status = 0;
  let data: unknown = null;
  let message = 'Erreur réseau';

  if (err && typeof err === 'object') {
    const e = err as { response?: { status?: number; data?: unknown }; message?: string };
    if (e.response) {
      status = typeof e.response.status === 'number' ? e.response.status : (typeof e.response.status === 'string' ? Number(e.response.status) : 0);
      data = e.response.data ?? null;
    }
    if (!data && typeof e.message === 'string') {
      message = e.message;
    }
  }

  if (data) {
    if (typeof data === 'string') message = data;
    else if (typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d.message === 'string') message = d.message;
      else if (typeof d.detail === 'string') message = d.detail;
      else if (d.errors) message = JSON.stringify(d.errors);
    }
  }

  let code: string | number | null = null;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const c = d['code'];
    if (typeof c === 'string' || typeof c === 'number') code = c;
  }

  return {
    status,
    message,
    code,
    details: data ?? null,
  };
}

// Response interceptor: normalize errors and emit global events for auth
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const parsed = parseApiError(error);
    // If unauthorized, notify app so AuthContext can react
    if (parsed.status === 401) {
      try {
        window.dispatchEvent(new CustomEvent('africart:unauthorized', { detail: parsed }));
      } catch {
        // ignore
      }
    }
    // Attach parsed info for callers that want it, but still reject the original error
      // Attach parsed info for callers that want it, but still reject the original error
      const errWithParsed = error as unknown as { parsed?: ParsedApiError };
      errWithParsed.parsed = parsed;
    return Promise.reject(error);
  }
);

export default api;
