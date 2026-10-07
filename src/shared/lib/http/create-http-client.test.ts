import { fetchCall, jsonResponse, mockFetch } from '@/test-utils';
import { APP_ERROR_CODE, AppError } from './app-error';
import { createHttpClient } from './create-http-client';

const BASE = 'http://api.test';

/** `send()` awaits getHeaders before calling fetch — wait until fetch is actually in flight. */
async function untilFetchCalled(fn: jest.Mock, times = 1) {
  for (let i = 0; i < 50 && fn.mock.calls.length < times; i++) await Promise.resolve();
}

describe('createHttpClient', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds the URL with query params, skipping null/undefined and repeating arrays', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
    const http = createHttpClient({ baseUrl: BASE });

    await http.get('/reviews', { query: { distributorId: 'd 1', cursor: undefined, star: null, ids: ['a', 'b'] } });

    expect(fetchCall(fetchMock, 0).url).toBe(`${BASE}/reviews?distributorId=d%201&ids=a&ids=b`);
  });

  it('sends JSON bodies with content-type and parses JSON responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 'r1' }));
    const http = createHttpClient({ baseUrl: BASE, getHeaders: () => ({ 'x-extra': '1' }) });

    const data = await http.post<{ id: string }>('/reviews', { star: 5 });

    const { init, headers } = fetchCall(fetchMock, 0);
    expect(data).toEqual({ id: 'r1' });
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"star":5}');
    expect(headers).toMatchObject({ 'content-type': 'application/json', accept: 'application/json', 'x-extra': '1' });
  });

  it('passes FormData through without a JSON content-type', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    const http = createHttpClient({ baseUrl: BASE });
    const form = new FormData();

    await http.post('/media', form);

    const { init, headers } = fetchCall(fetchMock, 0);
    expect(init.body).toBe(form);
    expect(headers['content-type']).toBeUndefined();
  });

  it('resolves undefined for 204', async () => {
    fetchMock.mockResolvedValue(jsonResponse(204));
    await expect(createHttpClient({ baseUrl: BASE }).delete('/x')).resolves.toBeUndefined();
  });

  it('throws an AppError from the error body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { statusCode: 409, code: 'USER_IDENTIFIER_ALREADY_USED', message: 'm' }));

    await expect(createHttpClient({ baseUrl: BASE }).post('/auth/register', {})).rejects.toMatchObject({
      status: 409,
      code: 'USER_IDENTIFIER_ALREADY_USED',
    });
  });

  it('maps a fetch failure to NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(createHttpClient({ baseUrl: BASE }).get('/x')).rejects.toMatchObject({
      status: 0,
      code: APP_ERROR_CODE.NETWORK_ERROR,
    });
  });

  it('maps its own timeout to TIMEOUT', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    );

    const promise = createHttpClient({ baseUrl: BASE }).get('/slow', { timeoutMs: 1000 });
    await untilFetchCalled(fetchMock);
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({ code: APP_ERROR_CODE.TIMEOUT });
  });

  it('rethrows the abort (not an AppError) when the caller cancels', async () => {
    const abortError = new Error('Aborted');
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(abortError));
        }),
    );
    const controller = new AbortController();

    const promise = createHttpClient({ baseUrl: BASE }).get('/x', { signal: controller.signal });
    await untilFetchCalled(fetchMock);
    controller.abort();

    await expect(promise).rejects.toBe(abortError);
  });

  // KNOWN BUG (reported in foundation CP6): a signal already aborted before the request is sent is ignored,
  // because the abort listener is attached after the fact. Remove `.failing` once create-http-client checks
  // `options.signal.aborted` up front.
  it.failing('does not send the request when the caller signal is already aborted', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    const controller = new AbortController();
    controller.abort();

    await expect(createHttpClient({ baseUrl: BASE }).get('/x', { signal: controller.signal })).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe('401 handling', () => {
    const unauthorized = () =>
      jsonResponse(401, { statusCode: 401, code: 'AUTH_INVALID_ACCESS_TOKEN', message: 'expired' });

    it('retries once with fresh headers when onUnauthorized resolves true', async () => {
      let token = 'old';
      fetchMock.mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(jsonResponse(200, { id: 'me' }));
      const onUnauthorized = jest.fn(async () => {
        token = 'new';
        return true;
      });
      const http = createHttpClient({
        baseUrl: BASE,
        getHeaders: () => ({ authorization: `Bearer ${token}` }),
        onUnauthorized,
      });

      await expect(http.get('/users/me')).resolves.toEqual({ id: 'me' });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', path: '/users/me' }));
      expect(fetchCall(fetchMock, 1).headers.authorization).toBe('Bearer new');
    });

    it('does not retry a second time when the retried request is still 401', async () => {
      fetchMock.mockResolvedValue(unauthorized());
      const onUnauthorized = jest.fn(async () => true);
      const http = createHttpClient({ baseUrl: BASE, onUnauthorized });

      await expect(http.get('/users/me')).rejects.toMatchObject({ status: 401 });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws the 401 without retrying when onUnauthorized resolves false', async () => {
      fetchMock.mockResolvedValue(unauthorized());
      const http = createHttpClient({ baseUrl: BASE, onUnauthorized: async () => false });

      const error = await http.get('/users/me').catch((e: unknown) => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({ status: 401, code: 'AUTH_INVALID_ACCESS_TOKEN' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
