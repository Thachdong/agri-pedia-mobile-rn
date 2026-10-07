import { Redirect, Stack, usePathname } from 'expo-router';
import { useSession } from '@/features/auth';
import { ROUTES } from '@/shared/constants';

/**
 * Guard of every private screen (files under src/app/(private)/; the group is not part of the URL).
 * Guest → login with `from` so login can come back. `Stack.Protected` is not used: it falls back to the anchor
 * route instead of the login screen the spec asks for.
 */
export default function PrivateLayout() {
  const { status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') return null;
  if (status === 'guest') return <Redirect href={{ pathname: ROUTES.login, params: { from: pathname } }} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
