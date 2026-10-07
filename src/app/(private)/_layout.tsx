import { Redirect, Stack, usePathname } from 'expo-router';
import { usePrivateGuard } from '@/features/auth';
import { ROUTES } from '@/shared/constants';

/**
 * Guard of every private screen (files under src/app/(private)/; the group is not part of the URL).
 * Guest → login with `from` so login can come back. `Stack.Protected` is not used: it falls back to the anchor
 * route instead of the login screen the spec asks for.
 */
export default function PrivateLayout() {
  const guard = usePrivateGuard();
  const pathname = usePathname();

  if (guard === 'wait') return null;
  if (guard === 'login') return <Redirect href={{ pathname: ROUTES.login, params: { from: pathname } }} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
