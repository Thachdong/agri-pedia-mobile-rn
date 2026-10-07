/** One page of a cursor-paginated endpoint. `nextCursor` null = last page. */
export type TCursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

/**
 * Normalises a cursor response `{ <listKey>: T[], nextCursor }` — the list key differs per endpoint
 * (`reviews`, `products`, ...; check `openapi.py op`). Missing list → empty page.
 * Extra page fields (`summary` of distributor reviews, `totalUnread` of chat rooms) are dropped — endpoints that
 * need them type the raw response (`TApiSchema<'List...Response'>`) instead.
 */
export function toCursorPage<T>(json: unknown, listKey: string): TCursorPage<T> {
  const body = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
  const items = body[listKey];
  const nextCursor = body.nextCursor;
  return {
    items: Array.isArray(items) ? (items as T[]) : [],
    nextCursor: typeof nextCursor === 'string' && nextCursor.length > 0 ? nextCursor : null,
  };
}
