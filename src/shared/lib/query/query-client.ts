import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAppError } from '@/shared/lib/http';
import { handleGlobalError } from './query-error';

const MAX_RETRIES = 2;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        // 4xx are business/permission errors → no retry; only network / timeout / 5xx are retried.
        retry: (failureCount, error) =>
          !(isAppError(error) && error.status >= 400 && error.status < 500) && failureCount < MAX_RETRIES,
      },
      mutations: { retry: false },
    },
    queryCache: new QueryCache({ onError: (error, query) => handleGlobalError(error, query.meta) }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => handleGlobalError(error, mutation.meta),
    }),
  });
}

let appQueryClient: QueryClient | undefined;

/** One instance for the app (tests pass their own client to QueryProvider). */
export function getQueryClient(): QueryClient {
  appQueryClient ??= makeQueryClient();
  return appQueryClient;
}
