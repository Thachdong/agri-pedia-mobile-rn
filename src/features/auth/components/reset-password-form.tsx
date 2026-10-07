import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { FormInput, SegmentedControl } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { applyServerErrors, FORM_ROOT_ERROR, FormField, useAppForm } from '@/shared/lib/form';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import {
  IDENTIFIER_INPUT,
  IDENTIFIER_LABELS,
  LOGIN_TYPE_OPTIONS,
  RESET_PASSWORD_ACTIVATE_LINK_ERRORS,
  RESET_PASSWORD_ERROR_FIELDS,
} from '../constants/auth.constants';
import { useRequestPasswordReset } from '../hooks/use-request-password-reset';
import { resetPasswordSchema } from '../schemas/reset-password.schema';
import type { TLoginType, TResetPasswordFormValues } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { getIssuedAt } from '../utils/otp.util';

const PURPOSE = 'RESET_PASSWORD';

/** Root error `type` of errors that come with an activate link. */
const ACTIVATE_LINK_ERROR = 'activate-link';

const DEFAULT_VALUES: TResetPasswordFormValues = { loginType: 'EMAIL', identifier: '' };

const isKnownResetPasswordError = (code: string): code is keyof typeof RESET_PASSWORD_ERROR_FIELDS =>
  code in RESET_PASSWORD_ERROR_FIELDS;

export type TResetPasswordFormProps = { className?: string };

/**
 * Request a password reset code (ui-ux.md §4). EMAIL by default, focus on the identifier.
 * Code sent — or the previous one still valid (OTP_ALREADY_REQUESTED) — → handoff { at = when the code was issued }
 * → /auth/change-password, where the code is entered and resent.
 */
export function ResetPasswordForm({ className }: TResetPasswordFormProps) {
  // react-hook-form's `watch` / `formState` mutate one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const router = useRouter();
  const mutation = useRequestPasswordReset();
  const form = useAppForm<TResetPasswordFormValues>({ schema: resetPasswordSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;

  const loginType = form.watch('loginType');
  const isSubmitting = mutation.isPending;

  useEffect(() => {
    form.setFocus('identifier');
  }, [form]);

  const goToChangePassword = async (values: TResetPasswordFormValues, at: string) => {
    await authHandoffStore.save({ ...values, at, purpose: PURPOSE });
    router.push(ROUTES.changePassword);
  };

  const showError = (error: unknown) => {
    if (!isAppError(error)) {
      applyServerErrors(form, error);
      return;
    }
    if (isKnownResetPasswordError(error.code)) {
      const { field, message } = RESET_PASSWORD_ERROR_FIELDS[error.code];
      form.setError(field, { type: 'server', message }, { shouldFocus: true });
      return;
    }
    if (RESET_PASSWORD_ACTIVATE_LINK_ERRORS.includes(error.code)) {
      form.setError(FORM_ROOT_ERROR, { type: ACTIVATE_LINK_ERROR, message: getErrorMessage(error) });
      return;
    }
    applyServerErrors(form, error);
  };

  const changeLoginType = (next: TLoginType) => {
    form.reset({ ...DEFAULT_VALUES, loginType: next });
    form.setFocus('identifier');
  };

  // `values` = schema output (identifier trimmed, phone separators stripped) → same value sent and handed off.
  const onSubmit = form.handleSubmit((values) => {
    Keyboard.dismiss();
    mutation.mutate(values, {
      onSuccess: () => goToChangePassword(values, new Date().toISOString()),
      onError: (error) => {
        const issuedAt = getIssuedAt(error);
        if (issuedAt) {
          void goToChangePassword(values, issuedAt);
          return;
        }
        showError(error);
      },
    });
  });

  const rootError = errors.root?.server;
  const identifierInput = IDENTIFIER_INPUT[loginType];

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl
        options={LOGIN_TYPE_OPTIONS}
        value={loginType}
        onChange={changeLoginType}
        accessibilityLabel="Reset mật khẩu bằng"
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
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
          />
        )}
      />

      <View className="gap-2">
        {rootError?.message && (
          <View className="flex-row flex-wrap items-center justify-center gap-1">
            <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-center text-destructive')}>
              {rootError.message}
            </Text>
            {rootError.type === ACTIVATE_LINK_ERROR && (
              <Link href={ROUTES.activate} asChild>
                <Pressable accessibilityRole="link" hitSlop={10} className="min-h-11 justify-center">
                  <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>Kích hoạt</Text>
                </Pressable>
              </Link>
            )}
          </View>
        )}
        <Button label="RESET" loading={isSubmitting} onPress={onSubmit} className="w-full max-w-60 self-center" />
      </View>
    </View>
  );
}
