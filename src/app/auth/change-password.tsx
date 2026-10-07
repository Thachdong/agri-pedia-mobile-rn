import { AuthFooterLinks, AuthHeader, ChangePasswordForm } from '@/features/auth';
import { AuthLayout } from '@/shared/components/templates';

/** /auth/change-password (public) — ui-ux.md §5, wireframe specs/ui-ux/image-7.png. Handoff init lives in ChangePasswordForm. */
export default function ChangePasswordScreen() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Change Password"
      footer={<AuthFooterLinks links={['register', 'login']} />}
    >
      <ChangePasswordForm />
    </AuthLayout>
  );
}
