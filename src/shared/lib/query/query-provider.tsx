import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { getQueryClient } from './query-client';
import { wireReactNativeManagers } from './react-native-managers';

type TQueryProviderProps = {
  children: React.ReactNode;
  /** Tests pass a fresh client; the app uses the singleton. */
  client?: QueryClient;
};

export function QueryProvider({ children, client }: TQueryProviderProps) {
  if (!client) wireReactNativeManagers();
  return <QueryClientProvider client={client ?? getQueryClient()}>{children}</QueryClientProvider>;
}
