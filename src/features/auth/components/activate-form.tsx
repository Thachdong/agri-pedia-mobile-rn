import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
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
  ACTIVATE_ERROR_FIELDS,
  IDENTIFIER_INPUT,
  IDENTIFIER_LABELS,
  LOGIN_TYPE_OPTIONS,
  OTP_CODE_LENGTH,
  RESEND_CODE_COOLDOWN_MS,
} from '../constants/auth.constants';
import { useActivate } from '../hooks/use-activate';
import { useAuthHandoff } from '../hooks/use-auth-handoff';
import { useResendCode } from '../hooks/use-resend-code';
import { activateSchema } from '../schemas/activate.schema';
import type { TActivateFormValues, TLoginType } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';

const PURPOSE = 'ACTIVATE_DISTRIBUTOR';

const DEFAULT_VALUES: TActivateFormValues = { loginType: 'EMAIL', identifier: '', code: '' };

const isKnownActivateError = (code: string): code is keyof typeof ACTIVATE_ERROR_FIELDS => code in ACTIVATE_ERROR_FIELDS;

export type TActivateFormProps = { className?: string };

/**
 * Activate a DISTRIBUTOR account (ui-ux.md §2).
 * Handoff from /auth/register → identifier pre-filled, focus on the code, resend countdown from the register time.
 * No handoff → EMAIL, focus on the identifier, resend allowed at once. Success → handoff cleared, /auth/login.
 */
export function ActivateForm({ className }: TActivateFormProps) {
  // react-hook-form's `watch` / `formState` mutate one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const router = useRouter();
  const handoff = useAuthHandoff(PURPOSE);
  const countdown = useCountdown({ durationMs: RESEND_CODE_COOLDOWN_MS, from: handoff.handoff?.at });
  const activateMutation = useActivate();
  const resendMutation = useResendCode(PURPOSE);
  const form = useAppForm<TActivateFormValues>({ schema: activateSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;

  const loginType = form.watch('loginType');
  const isSubmitting = activateMutation.isPending;

  useEffect(() => {
    if (handoff.status !== 'ready') return;
    if (!handoff.handoff) {
      form.setFocus('identifier');
      return;
    }
    form.reset({ ...DEFAULT_VALUES, loginType: handoff.handoff.loginType, identifier: handoff.handoff.identifier });
    // Wait for the reset to reach the inputs before focusing the code.
    requestAnimationFrame(() => form.setFocus('code'));
  }, [form, handoff]);

  const showError = (error: unknown) => {
    if (!isAppError(error)) {
      applyServerErrors(form, error);
      return;
    }
    if (isKnownActivateError(error.code)) {
      const { field, message } = ACTIVATE_ERROR_FIELDS[error.code];
      // Code kept as typed so the user can fix it digit by digit.
      form.setError(field, { type: 'server', message }, { shouldFocus: true });
      return;
    }
    if (error.code === 'OTP_ALREADY_CONSUMED') {
      // `type` = code → the message gets a login link.
      form.setError(FORM_ROOT_ERROR, { type: error.code, message: getErrorMessage(error) });
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

    const identifier = form.getValues('identifier').trim();
    resendMutation.mutate(
      { identifier },
      {
        onSuccess: async () => {
          const at = new Date().toISOString();
          countdown.restart(at);
          form.resetField('code');
          form.setFocus('code');
          // Persisted so the countdown survives an app restart.
          await authHandoffStore.save({ loginType: form.getValues('loginType'), identifier, at, purpose: PURPOSE });
        },
        onError: showError,
      },
    );
  };

  const onSubmit = form.handleSubmit(({ identifier, code }) => {
    Keyboard.dismiss();
    activateMutation.mutate(
      { identifier, code },
      {
        onSuccess: async () => {
          await authHandoffStore.clear(PURPOSE);
          toast.success('Kích hoạt tài khoản thành công. Vui lòng đăng nhập.');
          router.replace(ROUTES.login);
        },
        onError: showError,
      },
    );
  });

  const rootError = errors.root?.server;
  const identifierInput = IDENTIFIER_INPUT[loginType];

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl
        options={LOGIN_TYPE_OPTIONS}
        value={loginType}
        onChange={changeLoginType}
        accessibilityLabel="Kích hoạt bằng"
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
            // Last digit → keyboard down so ACTIVATE is in reach (RN has no focusable button).
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
        {rootError?.message && (
          <View className="flex-row flex-wrap items-center justify-center gap-1">
            <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-center text-destructive')}>
              {rootError.message}
            </Text>
            {rootError.type === 'OTP_ALREADY_CONSUMED' && (
              <Link href={ROUTES.login} replace asChild>
                <Pressable accessibilityRole="link" hitSlop={10} className="min-h-11 justify-center">
                  <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>Đăng nhập</Text>
                </Pressable>
              </Link>
            )}
          </View>
        )}
        <Button label="ACTIVATE" loading={isSubmitting} onPress={onSubmit} className="w-full max-w-60 self-center" />
      </View>
    </View>
  );
}
