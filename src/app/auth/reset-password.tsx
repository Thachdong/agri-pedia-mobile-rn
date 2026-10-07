import { AuthFooterLinks, AuthHeader, ResetPasswordForm } from '@/features/auth';
import { AuthLayout } from '@/shared/components/templates';

/** /auth/reset-password (public) — ui-ux.md §4, wireframe specs/ui-ux/image-3.png. Handoff + redirect live in ResetPasswordForm. */
export default function ResetPasswordScreen() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Reset Password"
      footer={<AuthFooterLinks links={['register', 'login', 'activate']} />}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
