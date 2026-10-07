import { Link, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { CountdownResend, FormInput, OtpCodeInput, SegmentedControl } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { useCountdown } from '@/shared/hooks';
import { applyServerErrors, FORM_ROOT_ERROR, FormField, useAppForm } from '@/shared/lib/form';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import {
  CHANGE_PASSWORD_ERROR_FIELDS,
  CHANGE_PASSWORD_RESET_LINK_ERRORS,
  IDENTIFIER_INPUT,
  IDENTIFIER_LABELS,
  LOGIN_TYPE_OPTIONS,
  OTP_CODE_LENGTH,
  RESEND_CODE_COOLDOWN_MS,
} from '../constants/auth.constants';
import { useAuthHandoff } from '../hooks/use-auth-handoff';
import { useConfirmPasswordReset } from '../hooks/use-confirm-password-reset';
import { useResendCode } from '../hooks/use-resend-code';
import { changePasswordSchema } from '../schemas/change-password.schema';
import { toIdentifier } from '../schemas/identifier.schema';
import type { TChangePasswordFormValues, TLoginType } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { loginHandoffStore } from '../utils/login-handoff.store';
import { toConfirmPasswordResetInput } from '../utils/change-password.util';

const PURPOSE = 'RESET_PASSWORD';

/** Error `type` (field or root) of errors that come with a link to /auth/reset-password (ask for a new code). */
const RESET_LINK_ERROR = 'reset-link';

const DEFAULT_VALUES: TChangePasswordFormValues = {
  loginType: 'EMAIL',
  identifier: '',
  newPassword: '',
  confirmPassword: '',
  code: '',
};

const isKnownChangePasswordError = (code: string): code is keyof typeof CHANGE_PASSWORD_ERROR_FIELDS =>
  code in CHANGE_PASSWORD_ERROR_FIELDS;

export type TChangePasswordFormProps = { className?: string };

/**
 * Set a new password with the reset code (ui-ux.md §5).
 * Handoff from /auth/reset-password → identifier pre-filled, focus on the password, resend countdown from the request time.
 * No handoff → EMAIL, focus on the identifier, resend allowed at once. Success → handoff cleared, /auth/login.
 */
export function ChangePasswordForm({ className }: TChangePasswordFormProps) {
  // react-hook-form's `watch` / `formState` mutate one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const router = useRouter();
  const navigation = useNavigation();
  const handoff = useAuthHandoff(PURPOSE);
  const countdown = useCountdown({ durationMs: RESEND_CODE_COOLDOWN_MS, from: handoff.handoff?.at });
  const confirmMutation = useConfirmPasswordReset();
  const resendMutation = useResendCode(PURPOSE);
  const form = useAppForm<TChangePasswordFormValues>({ schema: changePasswordSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;
  // Locks the form from success until the screen is replaced (handoff cleared asynchronously in between).
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginType = form.watch('loginType');
  const isSubmitting = confirmMutation.isPending || isRedirecting;

  useEffect(() => {
    if (handoff.status !== 'ready') return;
    if (!handoff.handoff) {
      form.setFocus('identifier');
      return;
    }
    form.reset({ ...DEFAULT_VALUES, loginType: handoff.handoff.loginType, identifier: handoff.handoff.identifier });
    // Wait for the reset to reach the inputs before focusing the password.
    const frame = requestAnimationFrame(() => form.setFocus('newPassword'));
    return () => cancelAnimationFrame(frame);
  }, [form, handoff]);

  const showError = (error: unknown) => {
    if (!isAppError(error)) {
      applyServerErrors(form, error);
      return;
    }
    const withResetLink = CHANGE_PASSWORD_RESET_LINK_ERRORS.includes(error.code);
    if (isKnownChangePasswordError(error.code)) {
      const { field, message } = CHANGE_PASSWORD_ERROR_FIELDS[error.code];
      // Code kept as typed so the user can fix it digit by digit.
      form.setError(field, { type: withResetLink ? RESET_LINK_ERROR : 'server', message }, { shouldFocus: true });
      return;
    }
    if (withResetLink) {
      form.setError(FORM_ROOT_ERROR, { type: RESET_LINK_ERROR, message: getErrorMessage(error) });
      return;
    }
    applyServerErrors(form, error);
  };

  const changeLoginType = (next: TLoginType) => {
    form.reset({ ...DEFAULT_VALUES, loginType: next });
    countdown.stop();
    form.setFocus('identifier');
  };

  const resend = async () => {
    form.clearErrors(FORM_ROOT_ERROR);
    const isIdentifierValid = await form.trigger('identifier', { shouldFocus: true });
    if (!isIdentifierValid) return;

    // Fixed at send time: switching tab while the request runs must not mix login types in the handoff.
    const sentLoginType = form.getValues('loginType');
    const identifier = toIdentifier(sentLoginType, form.getValues('identifier'));
    resendMutation.mutate(
      { identifier },
      {
        onSuccess: async () => {
          const at = new Date().toISOString();
          // Tab switched meanwhile → the form is reset for the other login type; leave it idle.
          if (form.getValues('loginType') === sentLoginType) {
            countdown.restart(at);
            form.resetField('code');
            form.setFocus('code');
          }
          // Persisted so the countdown survives an app restart.
          await authHandoffStore.save({ loginType: sentLoginType, identifier, at, purpose: PURPOSE });
        },
        onError: showError,
      },
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    Keyboard.dismiss();
    confirmMutation.mutate(toConfirmPasswordResetInput(values), {
      onSuccess: async () => {
        setIsRedirecting(true);
        countdown.stop();
        await Promise.all([
          authHandoffStore.clear(PURPOSE),
          loginHandoffStore.save({ loginType: values.loginType, identifier: values.identifier }),
        ]);
        toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập.');
        // Left the screen (back) while the handoff was being cleared → don't pull the user to /auth/login.
        if (navigation.isFocused()) router.replace(ROUTES.login);
      },
      onError: showError,
    });
  });

  const rootError = errors.root?.server;
  const showResetLink = rootError?.type === RESET_LINK_ERROR || errors.identifier?.type === RESET_LINK_ERROR;
  const identifierInput = IDENTIFIER_INPUT[loginType];

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl
        options={LOGIN_TYPE_OPTIONS}
        value={loginType}
        onChange={changeLoginType}
        accessibilityLabel="Đổi mật khẩu bằng"
        disabled={isSubmitting}
      />

      <FormField
        control={form.control}
        name="identifier"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label={IDENTIFIER_LABELS[loginType]}
            required
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            editable={!isSubmitting}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={255}
            keyboardType={identifierInput.keyboardType}
            autoComplete={identifierInput.autoComplete}
            textContentType={identifierInput.textContentType}
            placeholder={identifierInput.placeholder}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('newPassword')}
          />
        )}
      />

      <FormField
        control={form.control}
        name="newPassword"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label="Mật khẩu mới"
            hint="8–128 ký tự"
            required
            secureToggle
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            editable={!isSubmitting}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('confirmPassword')}
          />
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label="Xác nhận mật khẩu"
            required
            secureToggle
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            editable={!isSubmitting}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('code')}
          />
        )}
      />

      <FormField
        control={form.control}
        name="code"
        render={({ value, onChange, onBlur, error, ref }) => (
          <OtpCodeInput
            ref={ref}
            label="Code"
            required
            length={OTP_CODE_LENGTH}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // Last digit → keyboard down so CHANGE PASSWORD is in reach (RN has no focusable button).
            onComplete={() => Keyboard.dismiss()}
            error={error}
            editable={!isSubmitting}
          />
        )}
      />

      <CountdownResend
        remainingMs={countdown.remainingMs}
        onResend={() => void resend()}
        isSending={resendMutation.isPending}
        disabled={isSubmitting}
      />

      <View className="gap-2">
        {(rootError?.message || showResetLink) && (
          <View className="flex-row flex-wrap items-center justify-center gap-1">
            {rootError?.message && (
              <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-center text-destructive')}>
                {rootError.message}
              </Text>
            )}
            {showResetLink && (
              <Link href={ROUTES.resetPassword} replace asChild>
                <Pressable accessibilityRole="link" hitSlop={10} className="min-h-11 justify-center">
                  <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>Yêu cầu mã mới</Text>
                </Pressable>
              </Link>
            )}
          </View>
        )}
        <Button
          label="CHANGE PASSWORD"
          loading={isSubmitting}
          onPress={onSubmit}
          className="w-full max-w-60 self-center"
        />
      </View>
    </View>
  );
}
