import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession, type TCurrentUser } from '@/features/auth';
import { isMediaOfType, resolveMediaType, useUploadMedia, type TMediaFile, type TUploadedMedia } from '@/features/media';
import { Button } from '@/shared/components/atoms';
import { FilePickerField, FormInput, SelectField } from '@/shared/components/molecules';
import { BUSINESS_TYPE_OPTIONS } from '@/shared/constants';
import { pickDocument, pickImage } from '@/shared/lib/device';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { AppSheet, AppSheetTextInput, type TAppSheetProps } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { AVATAR_MEDIA_TYPES, BIO_MAX, LICENSE_MEDIA_TYPES } from '../constants/user.constants';
import { useUpdateMe } from '../hooks/use-update-me';
import { editProfileSchema } from '../schemas/edit-profile.schema';
import type { TEditProfileFormValues, TUpdateProfileInput } from '../types/user.types';

const LICENSE_PICK_TYPES = ['image/*', 'application/pdf'];

const toFormValues = (user: TCurrentUser | undefined): TEditProfileFormValues => ({
  username: user?.username ?? '',
  bussinessType: user?.bussinessType ?? null,
  bio: user?.bio ?? '',
  avatar: null,
  bussinessLicense: null,
});

export type TEditProfileSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
};

/**
 * M6 — the logged-in distributor edits their profile: username, business type, bio, avatar (image), business license
 * (image or pdf). On save: upload the newly picked files to TMP, then PATCH /users/me with their keys. Unpicked files
 * are kept. Errors under the form; success → toast + close (profile and session refetch). A save that fails after the
 * upload reuses the uploaded files on retry (no second upload of the same pick).
 */
export function EditProfileSheet({ sheetRef, onClose }: TEditProfileSheetProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const upload = useUploadMedia();
  const update = useUpdateMe(user?.id ?? '');
  const form = useAppForm<TEditProfileFormValues>({ schema: editProfileSchema, defaultValues: toFormValues(user) });
  // Latest session user for the reset on dismiss (the refetch after a save lands just before the sheet closes).
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  });
  // Picked file uri → its TMP upload, kept across failed saves of this opening.
  const uploadedRef = useRef(new Map<string, TUploadedMedia>());
  const { errors } = form.formState;
  const values = form.watch();
  const isSaving = upload.isPending || update.isPending;

  const setFile = (name: 'avatar' | 'bussinessLicense', file: TEditProfileFormValues['avatar']) =>
    form.setValue(name, file, { shouldDirty: true, shouldValidate: true });

  // Built at press time (not during render): the submit reads `uploadedRef`.
  const onSubmit = () =>
    form.handleSubmit(async ({ avatar, bussinessLicense, username, bio, bussinessType }) => {
      try {
        const uploadedByUri = uploadedRef.current;
        const files: TMediaFile[] = [];
        if (avatar) files.push({ file: avatar, type: AVATAR_MEDIA_TYPES[0] });
        const licenseType = bussinessLicense && resolveMediaType(bussinessLicense.extension, LICENSE_MEDIA_TYPES);
        if (bussinessLicense && licenseType) files.push({ file: bussinessLicense, type: licenseType });
        const toUpload = files.filter(({ file }) => !uploadedByUri.has(file.uri));
        const uploaded = await upload.mutateAsync(toUpload);
        toUpload.forEach(({ file }, index) => {
          const media = uploaded[index];
          if (media) uploadedByUri.set(file.uri, media);
        });

        const input: TUpdateProfileInput = { username, bio, bussinessType };
        const avatarMedia = avatar && uploadedByUri.get(avatar.uri);
        if (avatarMedia && isMediaOfType(avatarMedia, AVATAR_MEDIA_TYPES)) input.avatar = avatarMedia;
        const licenseMedia = bussinessLicense && uploadedByUri.get(bussinessLicense.uri);
        if (licenseMedia && isMediaOfType(licenseMedia, LICENSE_MEDIA_TYPES)) input.bussinessLicense = licenseMedia;
        await update.mutateAsync(input);

        uploadedByUri.clear();
        toast.success('Đã cập nhật hồ sơ');
        onClose();
      } catch (error) {
        applyServerErrors(form, error);
      }
    })();

  return (
    <AppSheet
      sheetRef={sheetRef}
      scrollable
      accessibilityLabel="Chỉnh sửa hồ sơ"
      // Next open starts from the saved profile (fresh after a save, unsaved edits dropped).
      onDismiss={() => {
        uploadedRef.current.clear();
        form.reset(toFormValues(userRef.current));
      }}
    >
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <Text accessibilityRole="header" className={TEXT.titleMedium}>
          Chỉnh sửa hồ sơ
        </Text>
        <FormField
          control={form.control}
          name="username"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              as={AppSheetTextInput}
              label="Tên hiển thị"
              required
              maxLength={100}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!isSaving}
            />
          )}
        />
        <SelectField
          label="Lĩnh vực kinh doanh"
          placeholder="Chọn lĩnh vực kinh doanh"
          required
          options={BUSINESS_TYPE_OPTIONS}
          value={values.bussinessType}
          onChange={(next) => form.setValue('bussinessType', next, { shouldDirty: true, shouldValidate: true })}
          disabled={isSaving}
          error={errors.bussinessType?.message}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ value, onChange, onBlur, error, ref }) => (
            <FormInput
              ref={ref}
              as={AppSheetTextInput}
              label="Giới thiệu"
              multiline
              maxLength={BIO_MAX}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error}
              editable={!isSaving}
            />
          )}
        />
        <FilePickerField
          label="Ảnh đại diện"
          value={values.avatar}
          currentLabel={user?.avatar ? 'Đã có ảnh đại diện' : undefined}
          hint="Ảnh jpg, png, webp — tối đa 10 MB"
          error={errors.avatar?.message ?? errors.avatar?.extension?.message ?? errors.avatar?.size?.message}
          disabled={isSaving}
          onPick={async () => {
            const file = await pickImage();
            if (file) setFile('avatar', file);
          }}
          onClear={() => setFile('avatar', null)}
        />
        <FilePickerField
          label="Giấy phép kinh doanh"
          value={values.bussinessLicense}
          currentLabel={user?.bussinessLicense ? 'Đã có giấy phép' : undefined}
          hint="Ảnh hoặc PDF — tối đa 10 MB"
          error={
            errors.bussinessLicense?.message ??
            errors.bussinessLicense?.extension?.message ??
            errors.bussinessLicense?.size?.message
          }
          disabled={isSaving}
          onPick={async () => {
            const file = await pickDocument({ types: LICENSE_PICK_TYPES });
            if (file) setFile('bussinessLicense', file);
          }}
          onClear={() => setFile('bussinessLicense', null)}
        />
        {errors.root?.server?.message && (
          <Text accessibilityRole="alert" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {errors.root.server.message}
          </Text>
        )}
        <Button label="Lưu" loading={isSaving} onPress={() => void onSubmit()} />
      </View>
    </AppSheet>
  );
}
