import { AuthFooterLinks, AuthHeader, RegisterForm } from '@/features/auth';
import { AuthLayout } from '@/shared/components/templates';

/** /auth/register (public) — ui-ux.md §1, wireframe specs/ui-ux/image.png. Provinces load with AddressFields. */
export default function RegisterScreen() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Register"
      footer={<AuthFooterLinks links={['login', 'activate', 'resetPassword']} />}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
