import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, StarRatingInput } from '@/shared/components/atoms';
import { FormInput } from '@/shared/components/molecules';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { AppSheet, AppSheetTextInput, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { REVIEW_CONTENT_MAX, REVIEW_CONTENT_PLACEHOLDER } from '../constants/review.constants';
import { useCreateReview } from '../hooks/use-create-review';
import { reviewSchema } from '../schemas/review.schema';
import type { TReviewFormValues, TReviewTargetType } from '../types/review.types';

const DEFAULT_VALUES: TReviewFormValues = { star: 0, content: '' };

const SHEET_LABEL: Record<TReviewTargetType, string> = { USER: 'Đánh giá shop', PRODUCT: 'Đánh giá sản phẩm' };

export type TReviewSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** USER = the shop (M4), PRODUCT = one of its products (M5). */
  targetType: TReviewTargetType;
  /** Distributor id (USER) or product id (PRODUCT). */
  targetId: string;
  /** Shop / product name in the title. */
  targetName: string;
};

/**
 * M4 / M5 — review a shop or a product (ACTIVE FARMER): 1..5 stars + content. Server errors (409 already reviewed,
 * 403 not allowed, 422 product not on sale...) under the form. Success → toast, reset, close (the review lists refetch).
 */
export function ReviewSheet({ sheetRef, onClose, targetType, targetId, targetName }: TReviewSheetProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const create = useCreateReview();
  const form = useAppForm<TReviewFormValues>({ schema: reviewSchema, defaultValues: DEFAULT_VALUES });
  const rootError = form.formState.errors.root?.server?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ targetType, targetId, ...values });
      toast.success('Đã gửi đánh giá');
      form.reset(DEFAULT_VALUES);
      onClose();
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  return (
    <AppSheet sheetRef={sheetRef} scrollable accessibilityLabel={SHEET_LABEL[targetType]} onDismiss={() => form.clearErrors()}>
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <Text accessibilityRole="header" numberOfLines={2} className={TEXT.titleMedium}>
          Đánh giá {targetName}
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
              placeholder={REVIEW_CONTENT_PLACEHOLDER[targetType]}
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
