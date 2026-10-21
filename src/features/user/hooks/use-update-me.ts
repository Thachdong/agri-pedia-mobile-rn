import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { updateMe } from '../services/user.service';
import type { TUpdateProfileInput } from '../types/user.types';

/**
 * Update the caller's profile. Stale: the session user and the caller's public distributor profile.
 * `silent`: the edit sheet shows errors under its form.
 * @param userId the logged-in user (= distributor id of their profile).
 */
export const useUpdateMe = (userId: string) =>
  useAppMutation({
    mutationFn: (input: TUpdateProfileInput) => updateMe(input),
    invalidates: () => [queryKeys.users.me(), queryKeys.distributors.detail(userId)],
    meta: { silent: true },
  });
