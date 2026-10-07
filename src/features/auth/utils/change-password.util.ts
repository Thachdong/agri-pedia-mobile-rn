import type { TChangePasswordFormValues, TConfirmPasswordResetInput } from '../types/auth.types';

/** Only the ConfirmPasswordResetDto fields — drops `loginType` and `confirmPassword` (client only). Already trimmed by the schema. */
export const toConfirmPasswordResetInput = ({
  identifier,
  code,
  newPassword,
}: TChangePasswordFormValues): TConfirmPasswordResetInput => ({ identifier, code, newPassword });
