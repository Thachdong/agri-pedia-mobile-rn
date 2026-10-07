import {
  useMutation,
  useQueryClient,
  type DefaultError,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';

export type TAppMutationOptions<TData, TVariables, TOnMutateResult> = UseMutationOptions<
  TData,
  DefaultError,
  TVariables,
  TOnMutateResult
> & {
  /**
   * Query keys made stale by a successful mutation — REQUIRED.
   * `false` only when the mutation updates the cache itself (`setQueryData`, optimistic update).
   */
  invalidates: ((variables: TVariables, data: TData) => QueryKey[]) | false;
};

export function useAppMutation<TData = unknown, TVariables = void, TOnMutateResult = unknown>({
  invalidates,
  onSuccess,
  ...options
}: TAppMutationOptions<TData, TVariables, TOnMutateResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      if (invalidates) {
        await Promise.all(
          invalidates(variables, data).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
        );
      }
      return onSuccess?.(data, variables, ...rest);
    },
  });
}
