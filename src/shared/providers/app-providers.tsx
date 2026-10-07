import { useEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getErrorMessage } from '@/shared/lib/http';
import { QueryProvider, setQueryErrorNotifier } from '@/shared/lib/query';
import { AppSheetProvider } from '@/shared/lib/sheet';
import { toast, ToastHost } from '@/shared/lib/toast';

/** App-wide providers, wrapped around the root Stack in src/app/_layout.tsx. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Global query/mutation errors (not `meta.silent`) → one toast per error code.
    setQueryErrorNotifier((error) => toast.error(getErrorMessage(error), { id: error.code }));
    return () => setQueryErrorNotifier(null);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryProvider>
          <AppSheetProvider>
            {children}
            <ToastHost />
          </AppSheetProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
