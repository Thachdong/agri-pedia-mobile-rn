import { toCursorPage } from './cursor-page';

describe('toCursorPage', () => {
  it('reads the endpoint list key and the next cursor', () => {
    const page = toCursorPage<{ id: string }>({ reviews: [{ id: 'r1' }, { id: 'r2' }], nextCursor: 'c2' }, 'reviews');
    expect(page).toEqual({ items: [{ id: 'r1' }, { id: 'r2' }], nextCursor: 'c2' });
  });

  it('treats null / empty nextCursor as the last page', () => {
    expect(toCursorPage({ products: [], nextCursor: null }, 'products').nextCursor).toBeNull();
    expect(toCursorPage({ products: [], nextCursor: '' }, 'products').nextCursor).toBeNull();
  });

  it('returns an empty page when the list key is missing or the body is not an object', () => {
    expect(toCursorPage({ items: [{ id: 1 }], nextCursor: 'x' }, 'reviews')).toEqual({ items: [], nextCursor: 'x' });
    expect(toCursorPage(undefined, 'reviews')).toEqual({ items: [], nextCursor: null });
  });
});
