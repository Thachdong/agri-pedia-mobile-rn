// Public API of the `auth` feature. Other features and src/app import only this file.
export { ActivateForm } from './components/activate-form';
export { AuthFooterLinks, type TAuthFooterLinkKey } from './components/auth-footer-links';
export { AuthHeader } from './components/auth-header';
export { ChangePasswordForm } from './components/change-password-form';
export { RegisterForm } from './components/register-form';
export { ResetPasswordForm } from './components/reset-password-form';
export { SessionListener } from './components/session-listener';
export { currentUserQuery } from './hooks/session.queries';
export { useActivate } from './hooks/use-activate';
export { useConfirmPasswordReset } from './hooks/use-confirm-password-reset';
export { useLogin } from './hooks/use-login';
export { useLogout } from './hooks/use-logout';
export { useRegister } from './hooks/use-register';
export { useRequestPasswordReset } from './hooks/use-request-password-reset';
export { useResendCode } from './hooks/use-resend-code';
export { usePrivateGuard } from './hooks/use-private-guard';
export { useSession } from './hooks/use-session';
export { useSignIn } from './hooks/use-sign-in';
export type { TCurrentUser, TLoginResponse, TSession, TSessionStatus } from './types/session.types';
export type {
  TActivateInput,
  TBusinessType,
  TConfirmPasswordResetInput,
  TLoginInput,
  TLoginType,
  TOtpPurpose,
  TRegisterInput,
  TRequestPasswordResetInput,
  TResendCodeInput,
  TUserRole,
} from './types/auth.types';
