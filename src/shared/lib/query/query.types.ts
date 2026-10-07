import type { AppError } from '@/shared/lib/http';

export type TQueryMeta = {
  /** true → no global error toast (the component shows the error itself, e.g. under a form). */
  silent?: boolean;
};

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
    queryMeta: TQueryMeta;
    mutationMeta: TQueryMeta;
  }
}
