import { AuthFooterLinks, AuthHeader, LoginForm } from '@/features/auth';
import { AuthLayout } from '@/shared/components/templates';

/**
 * /auth/login (public, guest-only) — ui-ux.md §3, wireframe specs/ui-ux/image-2.png. Pre-fill lives in LoginForm;
 * the redirect after login (`from` or role target) lives in the auth layout guard.
 */
export default function LoginScreen() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Login"
      footer={<AuthFooterLinks links={['register', 'activate', 'resetPassword']} />}
    >
      <LoginForm />
    </AuthLayout>
  );
}
