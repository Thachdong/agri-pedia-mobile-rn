import { useState, useSyncExternalStore } from 'react';
import { tokenStore } from '@/shared/lib/auth';
import { useSession } from './use-session';

/**
 * Decision of the (private) layout:
 * - `wait`: session still loading, or the user logged out while this screen was open (useLogout is going home —
 *   redirecting to login here would race with it).
 * - `login`: guest (never logged in, or the session expired) → login with `from`.
 * - `allow`: logged in.
 */
export function usePrivateGuard(): 'wait' | 'login' | 'allow' {
  const { status } = useSession();
  const endCount = useSyncExternalStore(tokenStore.subscribe, tokenStore.sessionEndCount);
  const endReason = useSyncExternalStore(tokenStore.subscribe, tokenStore.lastEndReason);
  const [endCountAtMount] = useState(endCount);

  if (status === 'loading') return 'wait';
  if (status === 'authenticated') return 'allow';

  const loggedOutWhileOpen = endReason === 'logout' && endCount !== endCountAtMount;
  return loggedOutWhileOpen ? 'wait' : 'login';
}
