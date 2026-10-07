import { useQueryClient } from '@tanstack/react-query';

/**
 * QueryClient for cache updates OUTSIDE a mutation — e.g. realtime (socket) events, session changes.
 * Mutations don't need it: use `invalidates` / the mutation callbacks.
 */
export const useAppQueryClient = () => useQueryClient();
