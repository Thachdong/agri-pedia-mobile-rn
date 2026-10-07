import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { QueryProvider } from '@/shared/lib/query';

/**
 * Fresh client per test: same staleTime as the app (makeQueryClient), but no retries, no garbage collection
 * while asserting and no global error toast.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

/** RNTL 14: `render` is async — `const { client, ...screen } = await renderWithProviders(<X />)`. */
export async function renderWithProviders(ui: ReactElement, client = createTestQueryClient()) {
  return { client, ...(await render(<QueryProvider client={client}>{ui}</QueryProvider>)) };
}

/** `await renderHook(() => useX(), { wrapper: hookWrapper(client) })` (async since RNTL 14). */
export function hookWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryProvider client={client}>{children}</QueryProvider>;
  };
}
