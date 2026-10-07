import { APP_ERROR_CODE, AppError, toAppError } from './app-error';
import type { IHttpClient, THttpMethod, TQueryParams, TRequestOptions, TUnauthorizedContext } from './http.types';

const DEFAULT_TIMEOUT_MS = 15_000;

export type TCreateHttpClientConfig = {
  baseUrl: string;
  /** Extra headers per request (the session layer adds `Authorization`). Receives the path so it can skip auth endpoints. */
  getHeaders?: (path: string) => Record<string, string> | Promise<Record<string, string>>;
  /**
   * Called once on a 401. Resolve `true` to retry the request once (headers re-read), `false` to throw the 401.
   * Filled by the session layer (single-flight refresh); a retried request is never retried again.
   */
  onUnauthorized?: (context: TUnauthorizedContext) => Promise<boolean>;
};

function buildUrl(baseUrl: string, path: string, query?: TQueryParams): string {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined && item !== null) {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    }
  }
  return params.length ? `${url}?${params.join('&')}` : url;
}

function isRawBody(body: unknown): body is FormData | Blob {
  return body instanceof FormData || body instanceof Blob;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
  const text = await response.text();
  return text || undefined;
}

export function createHttpClient(config: TCreateHttpClientConfig): IHttpClient {
  async function send(method: THttpMethod, path: string, body: unknown, options: TRequestOptions | undefined) {
    // A signal aborted before sending: don't send (the abort listener below would never fire).
    if (options?.signal?.aborted) throw options.signal.reason ?? new Error('Aborted');

    const headers: Record<string, string> = {
      accept: 'application/json',
      ...(await config.getHeaders?.(path)),
      ...options?.headers,
    };

    let payload: FormData | Blob | string | undefined;
    if (body !== undefined) {
      if (isRawBody(body)) {
        payload = body; // multipart boundary is set by fetch; RN file part = { uri, name, type }
      } else {
        payload = JSON.stringify(body);
        headers['content-type'] = 'application/json';
      }
    }

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const onCallerAbort = () => controller.abort();
    options?.signal?.addEventListener('abort', onCallerAbort);

    try {
      const response = await fetch(buildUrl(config.baseUrl, path, options?.query), {
        method,
        headers,
        body: payload,
        signal: controller.signal,
      });
      return { response, headers };
    } catch (cause) {
      if (options?.signal?.aborted) throw cause; // caller cancelled (react-query) — not an app error
      throw new AppError(
        timedOut
          ? { status: 0, code: APP_ERROR_CODE.TIMEOUT, message: 'Request timed out' }
          : { status: 0, code: APP_ERROR_CODE.NETWORK_ERROR, message: 'Network request failed' },
      );
    } finally {
      clearTimeout(timer);
      options?.signal?.removeEventListener('abort', onCallerAbort);
    }
  }

  async function request<T>(method: THttpMethod, path: string, body?: unknown, options?: TRequestOptions): Promise<T> {
    let { response, headers } = await send(method, path, body, options);

    if (response.status === 401 && config.onUnauthorized) {
      const error = toAppError(response.status, await parseBody(response));
      const shouldRetry = await config.onUnauthorized({ method, path, error, requestHeaders: headers });
      if (!shouldRetry) throw error;
      ({ response } = await send(method, path, body, options));
    }

    const data = await parseBody(response);
    if (!response.ok) throw toAppError(response.status, data);
    return data as T;
  }

  return {
    get: (path, options) => request('GET', path, undefined, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
  };
}
