import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, StarRatingInput } from '@/shared/components/atoms';
import { FormInput } from '@/shared/components/molecules';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { AppSheet, AppSheetTextInput, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { REVIEW_CONTENT_MAX, REVIEW_SHOP_CONTENT_PLACEHOLDER } from '../constants/review.constants';
import { useCreateReview } from '../hooks/use-create-review';
import { reviewSchema } from '../schemas/review.schema';
import type { TReviewFormValues } from '../types/review.types';

const DEFAULT_VALUES: TReviewFormValues = { star: 0, content: '' };

export type TReviewShopSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  distributorId: string;
  /** Shop name in the title. */
  shopName: string;
};

/**
 * M4 — review a shop (ACTIVE FARMER): 1..5 stars + content. Server errors (409 already reviewed, 403 not allowed...)
 * under the form. Success → toast, reset, close (the reviews tab refetches).
 */
export function ReviewShopSheet({ sheetRef, onClose, distributorId, shopName }: TReviewShopSheetProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const create = useCreateReview();
  const form = useAppForm<TReviewFormValues>({ schema: reviewSchema, defaultValues: DEFAULT_VALUES });
  const rootError = form.formState.errors.root?.server?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ targetType: 'USER', targetId: distributorId, ...values });
      toast.success('Đã gửi đánh giá');
      form.reset(DEFAULT_VALUES);
      onClose();
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  return (
    <AppSheet sheetRef={sheetRef} scrollable accessibilityLabel="Đánh giá shop" onDismiss={() => form.clearErrors()}>
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <Text accessibilityRole="header" numberOfLines={2} className={TEXT.titleMedium}>
          Đánh giá {shopName}
        </Text>
        <FormField
          control={form.control}
          name="star"
          render={({ value, onChange, error }) => (
            <View className="gap-1">
              <StarRatingInput value={value} onChange={onChange} invalid={!!error} disabled={create.isPending} />
              {error && <Text className={cn(TEXT.bodySmall, 'text-destructive')}>{error}</Text>}
            </View>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              as={AppSheetTextInput}
              label="Nội dung"
              required
              multiline
              maxLength={REVIEW_CONTENT_MAX}
              placeholder={REVIEW_SHOP_CONTENT_PLACEHOLDER}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!create.isPending}
            />
          )}
        />
        {rootError && (
          <Text accessibilityRole="alert" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {rootError}
          </Text>
        )}
        <Button label="Gửi đánh giá" loading={create.isPending} onPress={() => void onSubmit()} />
      </View>
    </AppSheet>
  );
}
