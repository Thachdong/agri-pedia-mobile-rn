import { useSyncExternalStore } from 'react';
import { tokenStore } from '@/shared/lib/auth';
import { useAppQuery } from '@/shared/lib/query';
import type { TSession } from '../types/session.types';
import { currentUserQuery } from './session.queries';

const LOADING: TSession = { status: 'loading', user: undefined, isLoggedIn: false };
const GUEST: TSession = { status: 'guest', user: undefined, isLoggedIn: false };

/**
 * guest | authenticated (with the current user) — the one way screens/components know who is logged in.
 * No token → guest. Token → GET /users/me (refreshes on 401 through http) → authenticated; failure → guest (same as Flutter).
 */
export function useSession(): TSession {
  const hasToken = useSyncExternalStore(tokenStore.subscribe, tokenStore.hasTokenSnapshot);
  const { data: user, isPending, isError } = useAppQuery({ ...currentUserQuery(), enabled: hasToken });

  if (!hasToken) return GUEST;
  if (user) return { status: 'authenticated', user, isLoggedIn: true };
  if (isError) return GUEST;
  return isPending ? LOADING : GUEST;
}
