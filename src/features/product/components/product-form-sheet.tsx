import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUploadMedia, type TUploadedMedia } from '@/features/media';
import { Button } from '@/shared/components/atoms';
import { FormInput, MultiImagePickerField, SelectField } from '@/shared/components/molecules';
import { pickImages } from '@/shared/lib/device';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { AppSheet, AppSheetTextInput, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_MEDIA_MAX,
  PRODUCT_NAME_MAX,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from '../constants/product.constants';
import { useCategories } from '../hooks/use-categories';
import { useCreateProduct } from '../hooks/use-create-product';
import { useUpdateProduct } from '../hooks/use-update-product';
import { productFormSchema } from '../schemas/product.schema';
import type { TProductDetail, TProductFormValues } from '../types/product.types';
import {
  EMPTY_PRODUCT_FORM,
  toCreateProductInput,
  toImageUploads,
  toProductFormValues,
  toUpdateProductInput,
} from '../utils/product-form.util';

/** Domain codes that belong to one field (the rest go under the form). */
const FIELD_ERRORS: Partial<Record<string, 'price' | 'quantity' | 'categoryId'>> = {
  PRODUCT_INVALID_PRICE: 'price',
  PRODUCT_INVALID_QUANTITY: 'quantity',
  PRODUCT_CATEGORY_NOT_FOUND: 'categoryId',
};

const toValues = (product: TProductDetail | undefined) => (product ? toProductFormValues(product) : EMPTY_PRODUCT_FORM);

export type TProductFormSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** The logged-in owner (me.id) — their shop's list becomes stale. */
  distributorId: string;
  /** Edit (M9) when given, else create (M8). */
  product?: TProductDetail;
};

/**
 * M8 / M9 — the owner creates or edits a product: name, description, price, quantity, unit, category, images (1..10);
 * edit adds status and removes current images. On save: upload the newly picked images to TMP, then POST / PATCH.
 * Errors under their field or the form; success → toast + close. A save that fails after the upload reuses the uploaded
 * images on retry. Closing drops unsaved edits.
 */
export function ProductFormSheet({ sheetRef, onClose, distributorId, product }: TProductFormSheetProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const isEdit = !!product;
  const categories = useCategories();
  const upload = useUploadMedia();
  const create = useCreateProduct(distributorId);
  const update = useUpdateProduct(distributorId);
  const form = useAppForm<TProductFormValues>({ schema: productFormSchema, defaultValues: toValues(product) });
  // Latest product for the reset on dismiss (the refetch after a save lands just before the sheet closes).
  const productRef = useRef(product);
  useEffect(() => {
    productRef.current = product;
  });
  // Picked file uri → its TMP upload, kept across failed saves of this opening.
  const uploadedRef = useRef(new Map<string, TUploadedMedia>());
  const { errors } = form.formState;
  const values = form.watch();
  const isSaving = upload.isPending || create.isPending || update.isPending;

  const setImages = (next: Pick<TProductFormValues, 'keptMediaIds' | 'images'>) => {
    form.setValue('keptMediaIds', next.keptMediaIds, { shouldDirty: true });
    form.setValue('images', next.images, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  };

  const onAddImages = async () => {
    const free = PRODUCT_MEDIA_MAX - values.keptMediaIds.length - values.images.length;
    const picked = await pickImages({ limit: free });
    const known = new Set(values.images.map((file) => file.uri));
    const fresh = picked.filter((file) => !known.has(file.uri)).slice(0, free);
    if (fresh.length > 0) setImages({ keptMediaIds: values.keptMediaIds, images: [...values.images, ...fresh] });
  };

  // Built at press time (not during render): the submit reads `uploadedRef`.
  const onSubmit = () =>
    form.handleSubmit(async (formValues) => {
      try {
        const uploadedByUri = uploadedRef.current;
        const toUpload = formValues.images.filter((file) => !uploadedByUri.has(file.uri));
        const uploaded = await upload.mutateAsync(toImageUploads(toUpload));
        toUpload.forEach((file, index) => {
          const media = uploaded[index];
          if (media) uploadedByUri.set(file.uri, media);
        });
        const media = formValues.images.flatMap((file) => uploadedByUri.get(file.uri) ?? []);

        if (product) {
          await update.mutateAsync({ productId: product.id, input: toUpdateProductInput(formValues, product, media) });
        } else {
          await create.mutateAsync(toCreateProductInput(formValues, media));
        }

        uploadedByUri.clear();
        toast.success(product ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm');
        onClose();
      } catch (error) {
        const field = isAppError(error) ? FIELD_ERRORS[error.code] : undefined;
        if (field) form.setError(field, { type: 'server', message: getErrorMessage(error) });
        else applyServerErrors(form, error);
      }
    })();

  const keptMedia = product?.media.filter((media) => values.keptMediaIds.includes(media.id)) ?? [];
  // Array-level error (count) first, else the first bad file (extension / size).
  const badImage = errors.images?.find?.((item) => item);
  const imagesError = errors.images?.message ?? badImage?.extension?.message ?? badImage?.size?.message;

  return (
    <AppSheet
      sheetRef={sheetRef}
      scrollable
      accessibilityLabel={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      // Next open starts from the saved product (fresh after a save, unsaved edits dropped).
      onDismiss={() => {
        uploadedRef.current.clear();
        form.reset(toValues(productRef.current));
      }}
    >
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </Text>
        <FormField
          control={form.control}
          name="name"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              as={AppSheetTextInput}
              label="Tên sản phẩm"
              required
              maxLength={PRODUCT_NAME_MAX}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!isSaving}
            />
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              as={AppSheetTextInput}
              label="Mô tả"
              required
              multiline
              maxLength={PRODUCT_DESCRIPTION_MAX}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!isSaving}
            />
          )}
        />
        <View className="flex-row gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ value, onChange, onBlur, error, ref }) => (
              <FormInput
                ref={ref}
                as={AppSheetTextInput}
                label="Giá (VND)"
                required
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => form.setFocus('quantity')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                editable={!isSaving}
                containerClassName="flex-1"
              />
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ value, onChange, onBlur, error, ref }) => (
              <FormInput
                ref={ref}
                as={AppSheetTextInput}
                label="Số lượng"
                required
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                editable={!isSaving}
                containerClassName="flex-1"
              />
            )}
          />
        </View>
        <SelectField
          label="Đơn vị"
          placeholder="Chọn đơn vị"
          required
          options={PRODUCT_UNIT_OPTIONS}
          value={values.unit || null}
          onChange={(next) => form.setValue('unit', next, { shouldDirty: true, shouldValidate: true })}
          disabled={isSaving}
          error={errors.unit?.message}
        />
        <SelectField
          label="Danh mục"
          placeholder="Chọn danh mục"
          required
          options={categories.data?.map(({ id, name }) => ({ value: id, label: name })) ?? []}
          value={values.categoryId || null}
          onChange={(next) => form.setValue('categoryId', next, { shouldDirty: true, shouldValidate: true })}
          loading={categories.isPending}
          onRetry={categories.isError ? () => void categories.refetch() : undefined}
          disabled={isSaving}
          error={errors.categoryId?.message ?? (categories.isError ? getErrorMessage(categories.error) : undefined)}
        />
        {isEdit && (
          <SelectField
            label="Trạng thái"
            required
            options={PRODUCT_STATUS_OPTIONS}
            value={values.status}
            onChange={(next) => form.setValue('status', next, { shouldDirty: true, shouldValidate: true })}
            disabled={isSaving}
            error={errors.status?.message}
          />
        )}
        <MultiImagePickerField
          label="Ảnh sản phẩm"
          existing={keptMedia.map((media) => ({ key: media.id, uri: media.url }))}
          picked={values.images.map((file) => ({ key: file.uri, uri: file.uri }))}
          onRemoveExisting={(id) =>
            setImages({ keptMediaIds: values.keptMediaIds.filter((kept) => kept !== id), images: values.images })
          }
          onRemovePicked={(uri) =>
            setImages({ keptMediaIds: values.keptMediaIds, images: values.images.filter((file) => file.uri !== uri) })
          }
          onAdd={() => void onAddImages()}
          max={PRODUCT_MEDIA_MAX}
          hint={`Ảnh jpg, png, webp — tối đa 10 MB mỗi ảnh, ${PRODUCT_MEDIA_MAX} ảnh`}
          error={imagesError}
          disabled={isSaving}
        />
        {errors.root?.server?.message && (
          <Text accessibilityRole="alert" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {errors.root.server.message}
          </Text>
        )}
        <Button label={isEdit ? 'Lưu' : 'Thêm sản phẩm'} loading={isSaving} onPress={() => void onSubmit()} />
      </View>
    </AppSheet>
  );
}
