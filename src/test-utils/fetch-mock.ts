/** Minimal `fetch` Response double for http / refresh tests. */
export function jsonResponse(status: number, body?: unknown): Response {
  const text = body === undefined ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => (name.toLowerCase() === 'content-type' && body !== undefined ? 'application/json' : null) },
    json: async () => JSON.parse(text),
    text: async () => text,
  } as unknown as Response;
}

/** Replaces global fetch for one test file; returns the jest mock. */
export function mockFetch() {
  const fn = jest.fn<Promise<Response>, [string, RequestInit?]>();
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

/** `fetch` call arguments, typed. */
export function fetchCall(fn: ReturnType<typeof mockFetch>, index: number) {
  const call = fn.mock.calls[index];
  if (!call) throw new Error(`fetch call #${index} not made`);
  const [url, init] = call;
  return { url, init: init ?? {}, headers: (init?.headers ?? {}) as Record<string, string> };
}
