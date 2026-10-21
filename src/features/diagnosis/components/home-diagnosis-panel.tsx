import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LoginRequiredSheet } from '@/features/auth';
import { Button, Icon } from '@/shared/components/atoms';
import { EmptyState, SegmentedControl } from '@/shared/components/molecules';
import { getErrorMessage } from '@/shared/lib/http';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { useCrops } from '../hooks/use-crops';
import { useDiagnosisSettings } from '../hooks/use-diagnosis-settings';
import { pickDefaultCrop } from '../utils/diagnosis-form.util';
import { DiagnosisForm } from './diagnosis-form';

export type THomeDiagnosisPanelProps = {
  /** Guest: sees the form with the default crop; changing the crop or using the form → login sheet (M1). */
  guest?: boolean;
  className?: string;
};

/**
 * Diagnosis block of home "/" (Specs/19102026): crop tabs (GET /knowledge/crops, default from GET /diagnoses/settings)
 * + the form. Another crop remounts the form (plant parts differ between crops). Settings failing never blocks.
 */
export function HomeDiagnosisPanel({ guest = false, className }: THomeDiagnosisPanelProps) {
  const crops = useCrops();
  const settings = useDiagnosisSettings();
  const loginSheet = useAppSheet();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  // A diagnosis being resized / sent: another crop would remount the form mid-way → tabs locked.
  const [isSending, setIsSending] = useState(false);

  const settingsReady = !settings.isPending || settings.isError;
  const crop =
    crops.data && settingsReady
      ? (crops.data.find((item) => item.code === selectedCode) ??
        pickDefaultCrop(crops.data, settings.data?.defaultCropType))
      : undefined;
  const remainingToday = settings.data?.remainingToday;

  const changeCrop = (code: string) => (guest ? loginSheet.open() : setSelectedCode(code));

  return (
    <View className={cn('gap-4 rounded-xl border border-border-subtle bg-background p-4', className)}>
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Icon name="scan-outline" color="primary" />
          <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'text-foreground')}>
            Chẩn đoán bệnh cây trồng
          </Text>
        </View>
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>
          Chọn cây, chụp hoặc tải ảnh lên — AI nhận diện bệnh, sâu hại và gợi ý cách xử lý.
          {remainingToday != null && ` Hôm nay bạn còn ${remainingToday} lượt.`}
        </Text>
      </View>

      {crops.isError ? (
        <View accessibilityRole="alert" className="gap-2">
          <Text className={cn(TEXT.bodyMedium, 'text-destructive')}>
            Không tải được danh sách cây trồng. {getErrorMessage(crops.error)}
          </Text>
          <Button label="Thử lại" variant="outline" size="sm" onPress={() => void crops.refetch()} />
        </View>
      ) : !crop ? (
        crops.data?.length === 0 ? (
          <EmptyState icon="leaf-outline" title="Chưa có cây trồng được hỗ trợ chẩn đoán." />
        ) : (
          <View accessible accessibilityLabel="Đang tải form chẩn đoán" className="gap-3">
            <View className="h-11 w-56 rounded-lg bg-surface" />
            <View className="h-24 rounded-lg bg-surface" />
            <View className="h-12 rounded-lg bg-surface" />
          </View>
        )
      ) : (
        <>
          {crops.data && crops.data.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <SegmentedControl
                options={crops.data.map((item) => ({ value: item.code, label: item.nameVi }))}
                value={crop.code}
                onChange={changeCrop}
                accessibilityLabel="Cây trồng cần chẩn đoán"
                disabled={isSending}
                className="self-start"
              />
            </ScrollView>
          )}
          <DiagnosisForm
            key={crop.code}
            crop={crop}
            settings={settings.data}
            guest={guest}
            onRequireLogin={loginSheet.open}
            onBusyChange={setIsSending}
          />
        </>
      )}

      {guest && (
        <LoginRequiredSheet
          sheetRef={loginSheet.ref}
          onClose={loginSheet.close}
          description="Đăng nhập để chẩn đoán bệnh cây trồng bằng ảnh."
        />
      )}
    </View>
  );
}
