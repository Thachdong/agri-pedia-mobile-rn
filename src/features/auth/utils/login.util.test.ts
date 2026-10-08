import { getPostLoginPath, getSafeFromPath } from './login.util';

describe('getSafeFromPath', () => {
  it.each(['/', '/chat', '/profile/u2?tab=reviews', '/notifications#top'])('keeps internal path %s', (path) => {
    expect(getSafeFromPath(path, '/fallback')).toBe(path);
  });

  it.each([
    ['undefined', undefined],
    ['array param', ['/chat']],
    ['empty', ''],
    ['relative', 'chat'],
    ['protocol-relative', '//evil.com'],
    ['absolute URL', 'https://evil.com'],
    ['backslash', '/\\evil.com'],
    ['control char', '/chat\n'],
    ['auth root', '/auth'],
    ['auth screen', '/auth/login?from=/chat'],
  ])('rejects %s → fallback', (_, value) => {
    expect(getSafeFromPath(value, '/fallback')).toBe('/fallback');
  });

  it('keeps paths that only start like /auth', () => {
    expect(getSafeFromPath('/authors', '/fallback')).toBe('/authors');
  });

  it('defaults the fallback to home', () => {
    expect(getSafeFromPath(undefined)).toBe('/');
  });
});

describe('getPostLoginPath', () => {
  it('safe `from` wins over the role target', () => {
    expect(getPostLoginPath({ id: 'u1', role: 'DISTRIBUTOR' }, '/chat')).toBe('/chat');
  });

  it('no / unsafe `from` → DISTRIBUTOR own profile, FARMER home', () => {
    expect(getPostLoginPath({ id: 'u1', role: 'DISTRIBUTOR' })).toBe('/profile/u1');
    expect(getPostLoginPath({ id: 'u1', role: 'FARMER' }, '//evil.com')).toBe('/');
  });
});
