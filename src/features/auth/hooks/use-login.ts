import { queryKeys, useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { login } from '../services/auth.service';
import type { TLoginInput } from '../types/auth.types';
import { loginHandoffStore } from '../utils/login-handoff.store';
import { useSignIn } from './use-sign-in';

/**
 * Logs in and starts the session (tokens + seeded current user → useSession is `authenticated` at once).
 * The session changed → public data (e.g. distributors near my primary address) is stale: everything except the
 * current user is invalidated AFTER the tokens are saved, so refetches go out with the Bearer token.
 * The login pre-fill is cleared here, not in the form: the guest-only guard unmounts the form as soon as the session
 * starts, and per-call callbacks of an unmounted component never run.
 */
export function useLogin() {
  const queryClient = useAppQueryClient();
  const signIn = useSignIn();

  return useAppMutation({
    mutationFn: (input: TLoginInput) => login(input),
    // The form shows the error itself (root, activate link) → no global toast.
    meta: { silent: true },
    invalidates: false, // done in onSuccess, after signIn
    onSuccess: async (response) => {
      await loginHandoffStore.clear();
      await signIn(response);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.all,
        predicate: ({ queryKey }) => queryKey[0] !== queryKeys.users.all[0],
      });
    },
  });
}
