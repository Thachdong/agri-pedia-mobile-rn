import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressFields, type TAddressFieldsErrors, type TAddressFieldsValue } from '@/features/location';
import { Button } from '@/shared/components/atoms';
import { applyServerErrors, useAppForm } from '@/shared/lib/form';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { AppSheet, AppSheetTextInput, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { useCreateMyAddress } from '../hooks/use-create-my-address';
import { createAddressSchema } from '../schemas/create-address.schema';
import type { TCreateAddressFormValues } from '../types/user.types';

const DEFAULT_VALUES: TCreateAddressFormValues = { province: '', ward: '', houseNumber: '' };

/** Address sub-field → form fields to validate on blur. */
const FIELDS_OF: Record<keyof TAddressFieldsErrors, (keyof TCreateAddressFormValues)[]> = {
  province: ['province'],
  ward: ['ward'],
  houseNumber: ['houseNumber'],
  location: ['lat', 'long'],
};

/** Server codes that belong to one field; the rest go under the form. */
const FIELD_OF_CODE: Partial<Record<string, keyof TCreateAddressFormValues>> = {
  USER_LOCATION_INVALID: 'province',
  USER_INVALID_COORDINATES: 'lat',
};

export type TAddAddressSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** The logged-in user. */
  userId: string;
};

/**
 * M7 — add an address: province → ward → house number → position on the map (its sheet stacks on top). POST on "Lưu";
 * a new address is a normal one (`isPrimary: false`) — the primary changes with the radio. Success → toast + close.
 */
export function AddAddressSheet({ sheetRef, onClose, userId }: TAddAddressSheetProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const create = useCreateMyAddress(userId);
  const form = useAppForm<TCreateAddressFormValues>({ schema: createAddressSchema, defaultValues: DEFAULT_VALUES });
  const { errors, isSubmitted } = form.formState;
  const address = form.watch();
  const isSaving = create.isPending;

  const changeAddress = (patch: Partial<TAddressFieldsValue>) => {
    for (const [key, value] of Object.entries(patch) as [keyof TAddressFieldsValue, string | number][]) {
      form.setValue(key, value, { shouldDirty: true, shouldValidate: isSubmitted });
    }
    if ('lat' in patch) void form.trigger(FIELDS_OF.location);
  };

  const addressErrors: TAddressFieldsErrors = {
    province: errors.province?.message,
    ward: errors.ward?.message,
    houseNumber: errors.houseNumber?.message,
    location: errors.lat?.message ?? errors.long?.message,
  };
  const rootError = errors.root?.server?.message;

  const onSubmit = form.handleSubmit(async ({ province, ward, houseNumber, lat, long }) => {
    if (lat === undefined || long === undefined) return; // schema requires both
    try {
      await create.mutateAsync({ province, ward, houseNumber, lat, long, isPrimary: false });
      toast.success('Đã thêm địa chỉ');
      onClose();
    } catch (error) {
      const field = isAppError(error) ? FIELD_OF_CODE[error.code] : undefined;
      if (field) form.setError(field, { type: 'server', message: getErrorMessage(error) });
      else applyServerErrors(form, error);
    }
  });

  return (
    <AppSheet
      sheetRef={sheetRef}
      scrollable
      accessibilityLabel="Thêm địa chỉ"
      // Next open starts empty.
      onDismiss={() => form.reset(DEFAULT_VALUES)}
    >
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          Thêm địa chỉ
        </Text>
        <AddressFields
          value={address}
          onChange={changeAddress}
          onBlur={(field) => void form.trigger(FIELDS_OF[field])}
          errors={addressErrors}
          disabled={isSaving}
          inputAs={AppSheetTextInput}
        />
        {rootError && (
          <Text accessibilityRole="alert" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {rootError}
          </Text>
        )}
        <Button label="Lưu" loading={isSaving} onPress={() => void onSubmit()} />
      </View>
    </AppSheet>
  );
}
