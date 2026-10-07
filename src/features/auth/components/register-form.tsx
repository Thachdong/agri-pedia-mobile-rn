import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Text, View, type TextInput } from 'react-native';
import { AddressFields, type TAddressFieldsErrors, type TAddressFieldsValue } from '@/features/location';
import { Button } from '@/shared/components/atoms';
import { FormInput, RadioCardGroup, SegmentedControl, SelectField } from '@/shared/components/molecules';
import { BUSINESS_TYPE_OPTIONS, ROUTES } from '@/shared/constants';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { isAppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { IDENTIFIER_LABELS, LOGIN_TYPE_OPTIONS, REGISTER_ERROR_FIELDS, ROLE_OPTIONS } from '../constants/auth.constants';
import { useRegister } from '../hooks/use-register';
import { registerSchema } from '../schemas/register.schema';
import type { TLoginType, TRegisterFormValues, TUserRole } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { toRegisterInput } from '../utils/register.util';

const DEFAULT_VALUES = {
  loginType: 'EMAIL',
  identifier: '',
  password: '',
  confirmPassword: '',
  username: '',
  role: 'FARMER',
  bussinessType: null,
  bio: '',
  address: { province: '', ward: '', houseNumber: '' },
} satisfies Partial<Omit<TRegisterFormValues, 'address'>> & { address: Partial<TRegisterFormValues['address']> };

/** Address sub-field → form paths to validate on blur. */
const ADDRESS_FIELDS = {
  province: ['address.province'],
  ward: ['address.ward'],
  houseNumber: ['address.houseNumber'],
  location: ['address.lat', 'address.long'],
} as const;

const IDENTIFIER_INPUT = {
  EMAIL: {
    keyboardType: 'email-address',
    autoComplete: 'email',
    textContentType: 'emailAddress',
    placeholder: 'ban@example.com',
  },
  PHONE: {
    keyboardType: 'phone-pad',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    placeholder: '0901 234 567',
  },
} as const;

const isKnownRegisterError = (code: string): code is keyof typeof REGISTER_ERROR_FIELDS =>
  code in REGISTER_ERROR_FIELDS;

export type TRegisterFormProps = { className?: string };

/**
 * Register form (ui-ux.md §1 (2)–(4)). Success: DISTRIBUTOR → handoff + /auth/activate; FARMER (already ACTIVE) → /auth/login.
 * Known domain errors go under their field, the rest under the form.
 */
export function RegisterForm({ className }: TRegisterFormProps) {
  // react-hook-form's `watch` / `formState` mutate one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const router = useRouter();
  const registerMutation = useRegister();
  const form = useAppForm<TRegisterFormValues>({ schema: registerSchema, defaultValues: DEFAULT_VALUES });
  const houseNumberRef = useRef<TextInput>(null);
  const { errors, isSubmitted } = form.formState;

  const loginType = form.watch('loginType');
  const role = form.watch('role');
  const bussinessType = form.watch('bussinessType');
  const address = form.watch('address') as TAddressFieldsValue;
  const isSubmitting = registerMutation.isPending;

  useEffect(() => form.setFocus('identifier'), [form]);

  const changeLoginType = (next: TLoginType) => {
    form.setValue('loginType', next);
    form.resetField('identifier');
    form.setFocus('identifier');
  };

  const changeRole = (next: TUserRole) => {
    form.setValue('role', next, { shouldDirty: true });
    if (next === 'FARMER') form.setValue('bussinessType', null);
    if (isSubmitted) void form.trigger('bussinessType');
  };

  const changeAddress = (patch: Partial<TAddressFieldsValue>) => {
    for (const [key, value] of Object.entries(patch) as [keyof TAddressFieldsValue, string | number][]) {
      form.setValue(`address.${key}`, value, { shouldDirty: true, shouldValidate: isSubmitted });
    }
    if ('lat' in patch) void form.trigger(ADDRESS_FIELDS.location);
  };

  const addressErrors: TAddressFieldsErrors = {
    province: errors.address?.province?.message,
    ward: errors.address?.ward?.message,
    houseNumber: errors.address?.houseNumber?.message,
    location: errors.address?.lat?.message ?? errors.address?.long?.message,
  };

  const onSubmit = form.handleSubmit((values) => {
    const input = toRegisterInput(values);
    registerMutation.mutate(input, {
      onSuccess: async () => {
        if (input.role === 'DISTRIBUTOR') {
          await authHandoffStore.save({
            loginType: input.loginType,
            identifier: input.identifier,
            at: new Date().toISOString(),
            purpose: 'ACTIVATE_DISTRIBUTOR',
          });
          router.replace(ROUTES.activate);
        } else {
          toast.success('Đăng ký thành công. Vui lòng đăng nhập.');
          router.replace(ROUTES.login);
        }
      },
      onError: (error) => {
        if (isAppError(error) && isKnownRegisterError(error.code)) {
          const { field, message } = REGISTER_ERROR_FIELDS[error.code];
          form.setError(field, { type: 'server', message }, { shouldFocus: true });
          return;
        }
        applyServerErrors(form, error);
      },
    });
  });

  const rootError = errors.root?.server?.message;
  const identifierInput = IDENTIFIER_INPUT[loginType];

  return (
    <View className={cn('gap-4', className)}>
      <SegmentedControl
        options={LOGIN_TYPE_OPTIONS}
        value={loginType}
        onChange={changeLoginType}
        accessibilityLabel="Đăng ký bằng"
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
            onSubmitEditing={() => form.setFocus('username')}
          />
        )}
      />

      <FormField
        control={form.control}
        name="username"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label="Tên hiển thị"
            hint="Bỏ trống sẽ dùng email/số điện thoại"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            editable={!isSubmitting}
            maxLength={100}
            autoComplete="nickname"
            textContentType="nickname"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => form.setFocus('bio')}
          />
        )}
      />

      <RadioCardGroup
        label="Bạn là"
        required
        options={ROLE_OPTIONS}
        value={role}
        onChange={changeRole}
        disabled={isSubmitting}
        error={errors.role?.message}
      />

      {role === 'DISTRIBUTOR' && (
        <SelectField
          label="Loại hình kinh doanh"
          placeholder="Chọn loại hình kinh doanh"
          required
          options={BUSINESS_TYPE_OPTIONS}
          value={bussinessType}
          onChange={(next) => form.setValue('bussinessType', next, { shouldDirty: true, shouldValidate: true })}
          disabled={isSubmitting}
          error={errors.bussinessType?.message}
        />
      )}

      <FormField
        control={form.control}
        name="bio"
        render={({ value, onChange, onBlur, error, ref }) => (
          <FormInput
            ref={ref}
            label="Giới thiệu"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            editable={!isSubmitting}
            multiline
            maxLength={1000}
          />
        )}
      />

      <AddressFields
        value={address}
        onChange={changeAddress}
        onBlur={(field) => void form.trigger(ADDRESS_FIELDS[field])}
        errors={addressErrors}
        disabled={isSubmitting}
        houseNumberRef={houseNumberRef}
      />

      <View className="gap-2">
        {rootError && (
          <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-center text-destructive')}>
            {rootError}
          </Text>
        )}
        <Button label="REGISTER" loading={isSubmitting} onPress={onSubmit} className="w-full max-w-60 self-center" />
      </View>
    </View>
  );
}
