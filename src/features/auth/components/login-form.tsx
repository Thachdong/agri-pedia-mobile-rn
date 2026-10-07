import { Link } from 'expo-router';
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
  LOGIN_ACTIVATE_LINK_ERRORS,
  LOGIN_TYPE_OPTIONS,
} from '../constants/auth.constants';
import { useLogin } from '../hooks/use-login';
import { useLoginHandoff } from '../hooks/use-login-handoff';
import { loginSchema } from '../schemas/login.schema';
import type { TLoginFormValues, TLoginType } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';

/** Root error `type` of errors that come with an activate link. */
const ACTIVATE_LINK_ERROR = 'activate-link';

/** Handoff time for activate opened from login: no code was just sent → countdown already over, resend enabled. */
const NO_RECENT_CODE_AT = new Date(0).toISOString();

const DEFAULT_VALUES: TLoginFormValues = { loginType: 'EMAIL', identifier: '', password: '' };

export type TLoginFormProps = { className?: string };

/**
 * Login form (ui-ux.md §3 (2)–(4)).
 * Login pre-fill (after register / activate / change-password) → identifier filled, focus on the password.
 * None → EMAIL, focus on the identifier. Success → session started by useLogin; the guest-only guard of /auth/*
 * navigates (`from` or role target), so the form never navigates itself.
 */
export function LoginForm({ className }: TLoginFormProps) {
  // react-hook-form's `watch` / `formState` mutate one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const handoff = useLoginHandoff();
  const mutation = useLogin();
  const form = useAppForm<TLoginFormValues>({ schema: loginSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;

  const loginType = form.watch('loginType');
  // Stays busy after success until the guard redirects (a second tap would log in twice).
  const isSubmitting = mutation.isPending || mutation.isSuccess;

  useEffect(() => {
    if (handoff.status !== 'ready') return;
    if (!handoff.handoff) {
      form.setFocus('identifier');
      return;
    }
    form.reset({ ...DEFAULT_VALUES, ...handoff.handoff });
    // Wait for the reset to reach the inputs before focusing the password.
    requestAnimationFrame(() => form.setFocus('password'));
  }, [form, handoff]);

  const showError = async (error: unknown, values: TLoginFormValues) => {
    if (isAppError(error) && LOGIN_ACTIVATE_LINK_ERRORS.includes(error.code)) {
      // Activate opens pre-filled with this account, resend enabled (no code was just sent).
      await authHandoffStore.save({
        loginType: values.loginType,
        identifier: values.identifier,
        at: NO_RECENT_CODE_AT,
        purpose: 'ACTIVATE_DISTRIBUTOR',
      });
      form.setError(FORM_ROOT_ERROR, { type: ACTIVATE_LINK_ERROR, message: getErrorMessage(error) });
      return;
    }
    // USER_INVALID_CREDENTIALS and the rest → under the form; 400 → fields.
    applyServerErrors(form, error);
  };

  const changeLoginType = (next: TLoginType) => {
    form.reset({ ...DEFAULT_VALUES, loginType: next });
    form.setFocus('identifier');
  };

  // `values` = schema output (identifier trimmed, phone separators stripped) → same value sent and handed off.
  const onSubmit = form.handleSubmit((values) => {
    Keyboard.dismiss();
    mutation.mutate(values, { onError: (error) => void showError(error, values) });
  });

  const rootError = errors.root?.server;
  const identifierInput = IDENTIFIER_INPUT[loginType];

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl
        options={LOGIN_TYPE_OPTIONS}
        value={loginType}
        onChange={changeLoginType}
        accessibilityLabel="Đăng nhập bằng"
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
            onSubmitEditing={() => form.setFocus('password')}
          />
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label="Mật khẩu"
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
            autoComplete="current-password"
            textContentType="password"
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
        <Button label="LOGIN" loading={isSubmitting} onPress={onSubmit} className="w-full max-w-60 self-center" />
      </View>
    </View>
  );
}
