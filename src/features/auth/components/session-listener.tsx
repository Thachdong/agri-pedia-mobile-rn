import { useEffect } from 'react';
import { onSessionExpired } from '@/shared/lib/auth';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import { toast } from '@/shared/lib/toast';

/**
 * Reacts to "refresh token rejected" (tokens already cleared by the http layer): drops the current user and tells
 * the user once. Navigation is left to the (private) guard. Mounted once in the root layout.
 */
export function SessionListener() {
  const queryClient = useAppQueryClient();

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.removeQueries({ queryKey: queryKeys.users.me() });
        toast.info('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', { id: 'session-expired' });
      }),
    [queryClient],
  );

  return null;
}
