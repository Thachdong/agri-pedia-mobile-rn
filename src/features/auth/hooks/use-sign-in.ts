import { useCallback } from 'react';
import { tokenStore } from '@/shared/lib/auth';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import type { TLoginResponse } from '../types/session.types';

/**
 * Starts a session from a login response: saves the tokens and seeds the current user, so `useSession`
 * is `authenticated` immediately (no extra GET /users/me). Used by the login mutation's onSuccess.
 */
export function useSignIn() {
  const queryClient = useAppQueryClient();
  return useCallback(
    async ({ accessToken, refreshToken, user }: TLoginResponse) => {
      queryClient.setQueryData(queryKeys.users.me(), user);
      await tokenStore.set({ accessToken, refreshToken });
    },
    [queryClient],
  );
}
