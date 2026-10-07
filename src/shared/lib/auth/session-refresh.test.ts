import { http } from '@/shared/lib/http';
import { fetchCall, jsonResponse, mockFetch } from '@/test-utils';
import { onSessionExpired, refreshTokens, tokenStore } from './index';

const OLD = { accessToken: 'access-old', refreshToken: 'refresh-old' };
const NEW = { accessToken: 'access-new', refreshToken: 'refresh-new' };
const expired = () => jsonResponse(401, { statusCode: 401, code: 'AUTH_INVALID_ACCESS_TOKEN', message: 'expired' });

/** Fake API: protected endpoints accept only the current access token; /auth/refresh-token answers with `refresh`. */
function fakeApi(fetchMock: ReturnType<typeof mockFetch>, refresh: () => Promise<Response>) {
  fetchMock.mockImplementation(async (url, init) => {
    if (url.endsWith('/auth/refresh-token')) return refresh();
    const auth = (init?.headers as Record<string, string>).authorization;
    return auth === `Bearer ${NEW.accessToken}` ? jsonResponse(200, { url }) : expired();
  });
}

const refreshCalls = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh-token'));

describe('session refresh through http', () => {
  let fetchMock: ReturnType<typeof mockFetch>;

  beforeEach(async () => {
    fetchMock = mockFetch();
    await tokenStore.clear();
    await tokenStore.set(OLD);
  });

  it('sends the access token as Bearer, but not on /auth/login', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await http.get('/users/me');
    await http.post('/auth/login', {});

    expect(fetchCall(fetchMock, 0).headers.authorization).toBe(`Bearer ${OLD.accessToken}`);
    expect(fetchCall(fetchMock, 1).headers.authorization).toBeUndefined();
  });

  it('refreshes exactly once for 3 concurrent 401s, then retries each request with the new token', async () => {
    fakeApi(fetchMock, async () => jsonResponse(200, NEW));

    const results = await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')]);

    expect(refreshCalls(fetchMock)).toHaveLength(1);
    expect(JSON.parse(String(refreshCalls(fetchMock)[0]?.[1]?.body))).toEqual({ refreshToken: OLD.refreshToken });
    expect(results).toEqual([{ url: 'http://api.test/a' }, { url: 'http://api.test/b' }, { url: 'http://api.test/c' }]);
    expect(tokenStore.get()).toEqual(NEW);
  });

  it('clears the session and emits session-expired when the refresh token is rejected', async () => {
    fakeApi(fetchMock, async () =>
      jsonResponse(401, { statusCode: 401, code: 'USER_INVALID_REFRESH_TOKEN', message: 'revoked' }),
    );
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(http.get('/users/me')).rejects.toMatchObject({ status: 401, code: 'AUTH_INVALID_ACCESS_TOKEN' });

    expect(tokenStore.get()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('keeps the session when the refresh fails on the network (user stays logged in)', async () => {
    fakeApi(fetchMock, async () => {
      throw new TypeError('Network request failed');
    });
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(http.get('/users/me')).rejects.toMatchObject({ status: 401 });

    expect(tokenStore.get()).toEqual(OLD);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('does not refresh for a 401 from /auth/login (wrong credentials)', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { statusCode: 401, code: 'USER_INVALID_CREDENTIALS', message: 'bad' }),
    );

    await expect(http.post('/auth/login', {})).rejects.toMatchObject({ code: 'USER_INVALID_CREDENTIALS' });
    expect(refreshCalls(fetchMock)).toHaveLength(0);
  });

  it('does not refresh for a guest (no tokens)', async () => {
    await tokenStore.clear();
    fetchMock.mockResolvedValue(expired());

    await expect(http.get('/users/me')).rejects.toMatchObject({ status: 401 });
    expect(refreshCalls(fetchMock)).toHaveLength(0);
  });

  it('resolves null without calling the server when there is no refresh token', async () => {
    await tokenStore.clear();
    await expect(refreshTokens()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
