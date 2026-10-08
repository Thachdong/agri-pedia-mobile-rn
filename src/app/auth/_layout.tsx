import { Redirect, Stack, useGlobalSearchParams, type Href } from 'expo-router';
import { getPostLoginPath, useSession } from '@/features/auth';

/**
 * Guest-only guard of every /auth/* screen. Logged in (right after login, or opening an auth link while logged in) →
 * `from` (safe internal path, set by the (private) guard) else the role target: DISTRIBUTOR → own profile, FARMER → home.
 * Session still loading → the auth screens render as for a guest (no blank screen while GET /users/me runs).
 */
export default function AuthGroupLayout() {
  const session = useSession();
  const { from } = useGlobalSearchParams<{ from?: string }>();

  if (session.status === 'authenticated') {
    return <Redirect href={getPostLoginPath(session.user, from) as Href} />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
