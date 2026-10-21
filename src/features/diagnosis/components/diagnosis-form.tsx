import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { FormInput, type TSelectOption } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { pickImages, resizeImage, takePhoto } from '@/shared/lib/device';
import { applyServerErrors, FORM_ROOT_ERROR, FormField, useAppForm } from '@/shared/lib/form';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import {
  DIAGNOSIS_ERROR_CODE,
  DIAGNOSIS_IMAGE_LIMITS,
  DIAGNOSIS_MAX_IMAGES,
  DIAGNOSIS_NOTE_MAX,
  IMAGE_DECODE_ERROR,
} from '../constants/diagnosis.constants';
import { useCreateDiagnosis } from '../hooks/use-create-diagnosis';
import { diagnosisFormSchema } from '../schemas/diagnosis.schema';
import type {
  TDiagnosisFormContext,
  TDiagnosisFormImage,
  TDiagnosisFormValues,
  TDiagnosisSettings,
  TPlantPart,
} from '../types/diagnosis.types';
import type { TCrop } from '../types/knowledge.types';
import { fallbackPlantPart, invalidImageIndexes } from '../utils/diagnosis-form.util';
import { DiagnosisImageSlot } from './diagnosis-image-slot';

const DEFAULT_VALUES: TDiagnosisFormValues = { images: [], note: '' };

const newImage = (uri: string): TDiagnosisFormImage => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  uri,
  plantPart: '',
});

export type TDiagnosisFormProps = {
  /** Crop being diagnosed — its `plantParts` are the choices of each photo. */
  crop: TCrop;
  /** GET /diagnoses/settings; missing (loading / failed) → server defaults. */
  settings: TDiagnosisSettings | undefined;
  /** Guest: the form is shown but every action calls `onRequireLogin` instead. */
  guest?: boolean;
  onRequireLogin?: () => void;
  /** Resizing / sending started or ended — the owner locks what would remount the form (crop tabs). */
  onBusyChange?: (busy: boolean) => void;
  className?: string;
};

/**
 * Diagnosis form (home): photos from the camera / library (1..maxImages), the plant part of each, a note, "Chẩn đoán".
 * Photos are resized to the settings limits, then POST /diagnoses → report screen. Errors: per photo (not decodable,
 * DIAGNOSIS_INVALID_IMAGE with an index) or under the form; the photos stay to send again.
 */
export function DiagnosisForm({
  crop,
  settings,
  guest = false,
  onRequireLogin,
  onBusyChange,
  className,
}: TDiagnosisFormProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const router = useRouter();
  const create = useCreateDiagnosis();
  const maxImages = settings?.maxImages ?? DIAGNOSIS_MAX_IMAGES;
  const form = useAppForm<TDiagnosisFormValues>({
    schema: diagnosisFormSchema,
    defaultValues: DEFAULT_VALUES,
    context: { maxImages } satisfies TDiagnosisFormContext,
  });
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [isResizing, setIsResizing] = useState(false);
  const { errors } = form.formState;
  const images = form.watch('images');
  const isBusy = isResizing || create.isPending;
  const noQuotaLeft = settings?.remainingToday === 0;

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);
  const free = Math.max(maxImages - images.length, 0);

  const plantPartOptions: TSelectOption<TPlantPart>[] = crop.plantParts.map((part) => ({
    value: part.code,
    label: part.nameVi,
  }));

  /** Guest → login sheet; otherwise runs `action`. */
  const guarded = (action: () => void) => () => (guest ? onRequireLogin?.() : action());

  const setImages = (next: TDiagnosisFormImage[]) =>
    form.setValue('images', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  const setImageError = (id: string, message: string | null) =>
    setImageErrors((current) => {
      const { [id]: _removed, ...rest } = current;
      return message ? { ...rest, [id]: message } : rest;
    });

  const addImages = (uris: string[]) => {
    const current = form.getValues('images');
    const known = new Set(current.map((image) => image.uri));
    const fresh = uris.filter((uri) => !known.has(uri)).slice(0, Math.max(maxImages - current.length, 0));
    if (fresh.length > 0) setImages([...current, ...fresh.map(newImage)]);
  };

  const onTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo) addImages([photo.uri]);
  };

  const onPickImages = async () => {
    const picked = await pickImages({ limit: free });
    addImages(picked.map((file) => file.uri));
  };

  const removeImage = (id: string) => {
    setImages(form.getValues('images').filter((image) => image.id !== id));
    setImageError(id, null);
  };

  const setPlantPart = (id: string, plantPart: TPlantPart) =>
    setImages(form.getValues('images').map((image) => (image.id === id ? { ...image, plantPart } : image)));

  const handleError = (error: unknown, values: TDiagnosisFormValues) => {
    if (isAppError(error) && error.code === DIAGNOSIS_ERROR_CODE.invalidImage) {
      const indexes = invalidImageIndexes(error.details);
      indexes.forEach((index) => {
        const image = index === null ? undefined : values.images[index];
        if (image) setImageError(image.id, getErrorMessage(error));
      });
      if (indexes.length === 0 || indexes.includes(null)) {
        form.setError(FORM_ROOT_ERROR, { type: 'server', message: getErrorMessage(error) });
      }
      return;
    }
    if (isAppError(error) && error.code === DIAGNOSIS_ERROR_CODE.cropNotSupported) {
      toast.error(getErrorMessage(error));
      return;
    }
    applyServerErrors(form, error);
  };

  const onSubmit = () =>
    form.handleSubmit(async (values) => {
      const limits = settings
        ? { maxWidth: settings.maxImageWidth, maxHeight: settings.maxImageHeight, maxBytes: settings.maxImageBytes }
        : DIAGNOSIS_IMAGE_LIMITS;
      setIsResizing(true);
      const resized = await Promise.all(values.images.map((image) => resizeImage(image.uri, limits)));
      setIsResizing(false);

      const failed = values.images.filter((_, index) => !resized[index]);
      if (failed.length > 0) {
        failed.forEach((image) => setImageError(image.id, IMAGE_DECODE_ERROR));
        return;
      }

      try {
        const fallback = fallbackPlantPart(crop);
        const { id } = await create.mutateAsync({
          cropType: crop.code,
          images: values.images.map((image, index) => ({
            uri: resized[index]?.uri ?? image.uri,
            plantPart: image.plantPart || fallback,
          })),
          note: values.note.trim() || undefined,
        });
        form.reset(DEFAULT_VALUES);
        setImageErrors({});
        router.push(ROUTES.diagnosis(id));
      } catch (error) {
        handleError(error, values);
      }
    })();

  const imagesError = errors.images?.message ?? errors.images?.root?.message;
  const rootError = errors.root?.server?.message;

  return (
    <View className={cn('gap-4', className)}>
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className={cn(TEXT.labelLarge, 'text-foreground')}>Ảnh cây trồng</Text>
          <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            {images.length} / {maxImages}
          </Text>
        </View>
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          Chụp rõ phần bị bệnh, đủ sáng, mỗi ảnh một bộ phận.
        </Text>
        {images.map((image, index) => (
          <DiagnosisImageSlot
            key={image.id}
            uri={image.uri}
            index={index}
            plantPart={image.plantPart}
            plantPartOptions={plantPartOptions}
            onPlantPartChange={(plantPart) => setPlantPart(image.id, plantPart)}
            onRemove={() => removeImage(image.id)}
            error={imageErrors[image.id]}
            disabled={isBusy}
          />
        ))}
        {free > 0 && (
          <View className="flex-row gap-2">
            <Button
              label="Chụp ảnh"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onPress={guarded(() => void onTakePhoto())}
              className="flex-1"
            />
            <Button
              label="Chọn ảnh"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onPress={guarded(() => void onPickImages())}
              className="flex-1"
            />
          </View>
        )}
        {imagesError && (
          <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {imagesError}
          </Text>
        )}
      </View>

      {guest ? (
        // Guest: looks like the note field, a tap asks to log in (no keyboard).
        <Pressable accessibilityRole="button" accessibilityLabel="Ghi chú, cần đăng nhập" onPress={onRequireLogin}>
          <View pointerEvents="none">
            <FormInput
              label="Ghi chú (không bắt buộc)"
              editable={false}
              placeholder="Triệu chứng, thời gian xuất hiện..."
            />
          </View>
        </Pressable>
      ) : (
        <FormField
          control={form.control}
          name="note"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              label="Ghi chú (không bắt buộc)"
              placeholder="Triệu chứng, thời gian xuất hiện..."
              multiline
              maxLength={DIAGNOSIS_NOTE_MAX}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!isBusy}
            />
          )}
        />
      )}

      {rootError && (
        <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodyMedium, 'text-destructive')}>
          {rootError}
        </Text>
      )}
      <Button
        label={isResizing ? 'Đang xử lý ảnh...' : 'Chẩn đoán'}
        loading={isBusy}
        disabled={noQuotaLeft}
        onPress={guest ? onRequireLogin : onSubmit}
      />
      {noQuotaLeft && (
        <Text className={cn(TEXT.bodySmall, 'text-center text-muted-foreground')}>
          Bạn đã dùng hết lượt chẩn đoán hôm nay, vui lòng thử lại ngày mai.
        </Text>
      )}
    </View>
  );
}
