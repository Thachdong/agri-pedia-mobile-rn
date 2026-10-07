import { ActivateForm, AuthFooterLinks, AuthHeader } from '@/features/auth';
import { AuthLayout } from '@/shared/components/templates';

/** /auth/activate (public) — ui-ux.md §2, wireframe specs/ui-ux/image-1.png. Handoff init lives in ActivateForm. */
export default function ActivateScreen() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Activate Account"
      footer={<AuthFooterLinks links={['register', 'login', 'resetPassword']} />}
    >
      <ActivateForm />
    </AuthLayout>
  );
}
