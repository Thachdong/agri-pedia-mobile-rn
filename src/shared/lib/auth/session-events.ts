type TListener = () => void;

const listeners = new Set<TListener>();

/**
 * "Session expired" = the refresh token was rejected; tokens are already cleared.
 * Shared code can't import features, so the auth feature subscribes here (SessionListener).
 */
export function onSessionExpired(listener: TListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => listener());
}
