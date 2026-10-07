import { useRouter } from 'expo-router';
import { ROUTES } from '@/shared/constants';
import { tokenStore } from '@/shared/lib/auth';
import { useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { logout } from '../services/session.service';

/**
 * Ends the session: POST /auth/logout best effort (offline / already revoked is fine), then always clears
 * tokens (reason `logout`, so an open private screen waits instead of redirecting to login) + the whole cache
 * (no data of the previous user survives), and goes home.
 */
export function useLogout() {
  const queryClient = useAppQueryClient();
  const router = useRouter();

  return useAppMutation({
    mutationFn: async () => {
      const refreshToken = tokenStore.get()?.refreshToken;
      if (refreshToken) await logout(refreshToken).catch(() => undefined);
    },
    invalidates: false, // cache is cleared below
    meta: { silent: true },
    onSettled: async () => {
      await tokenStore.clear('logout');
      queryClient.clear();
      router.replace(ROUTES.home);
    },
  });
}
