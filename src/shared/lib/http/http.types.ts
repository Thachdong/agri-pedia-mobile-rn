type TQueryValue = string | number | boolean | null | undefined;

export type TQueryParams = Record<string, TQueryValue | TQueryValue[]>;

export type TRequestOptions = {
  query?: TQueryParams;
  headers?: Record<string, string>;
  /** Caller cancellation (react-query passes one to queryFn). Aborting rethrows the AbortError, not an AppError. */
  signal?: AbortSignal;
  /** Per-request timeout; default 15s → AppError TIMEOUT. */
  timeoutMs?: number;
};

export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Info passed to `onUnauthorized` so the session layer can decide whether to refresh. */
export type TUnauthorizedContext = {
  method: THttpMethod;
  path: string;
  error: unknown;
};

/** HTTP client of the project — services call it, never `fetch`. */
export interface IHttpClient {
  get<T>(path: string, options?: TRequestOptions): Promise<T>;
  delete<T>(path: string, options?: TRequestOptions): Promise<T>;
  post<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
  put<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B, options?: TRequestOptions): Promise<T>;
}
