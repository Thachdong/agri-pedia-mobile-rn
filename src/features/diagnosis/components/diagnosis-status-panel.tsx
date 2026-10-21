import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button, Icon } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import type { TDiagnosis } from '../types/diagnosis.types';
import { sortedImages } from '../utils/diagnosis-view.util';

export type TDiagnosisStatusPanelProps = {
  diagnosis: Pick<TDiagnosis, 'status' | 'images'>;
  /** Still PROCESSING after the 5-minute wait. */
  timedOut?: boolean;
  onReload?: () => unknown;
  className?: string;
};

const PANEL = 'items-center gap-4 rounded-xl border border-border-subtle bg-card px-6 py-10';

/** Waiting / failed state of the result screen: PROCESSING (spinner), wait timed out (reload), FAILED (diagnose again). */
export function DiagnosisStatusPanel({ diagnosis, timedOut = false, onReload, className }: TDiagnosisStatusPanelProps) {
  const router = useRouter();

  if (diagnosis.status === 'FAILED') {
    return (
      <View className={cn(PANEL, className)}>
        <Icon name="alert-circle-outline" size="lg" color="destructive" />
        <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'text-center')}>
          Không phân tích được ảnh, vui lòng thử lại
        </Text>
        <Button label="Chẩn đoán lại" variant="highlight" onPress={() => router.replace(ROUTES.home)} />
      </View>
    );
  }

  const thumbnails = sortedImages(diagnosis.images).filter((image) => image.url);

  return (
    <View accessibilityLiveRegion="polite" className={cn(PANEL, className)}>
      {timedOut ? (
        <Icon name="time-outline" size="lg" color="warning" />
      ) : (
        <ActivityIndicator size="large" color={colors.highlight} accessibilityLabel="Đang phân tích" />
      )}
      <View className="items-center gap-1">
        <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'text-center')}>
          {timedOut ? 'Vẫn đang xử lý' : 'Đang phân tích ảnh…'}
        </Text>
        <Text className={cn(TEXT.bodyMedium, 'text-center text-muted-foreground')}>
          {timedOut ? 'Bạn có thể quay lại sau để xem kết quả.' : 'Thường mất 10–30 giây. Kết quả sẽ tự hiện khi xong.'}
        </Text>
      </View>
      {thumbnails.length > 0 && (
        <View accessibilityLabel="Ảnh đã gửi" className="flex-row flex-wrap justify-center gap-2">
          {thumbnails.map((image) => (
            <View key={image.index} className="h-14 w-14 overflow-hidden rounded-md border border-border-subtle bg-surface">
              <Image
                source={{ uri: image.url ?? undefined }}
                contentFit="cover"
                accessibilityLabel={`Ảnh ${image.index + 1}`}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ))}
        </View>
      )}
      {timedOut && <Button label="Tải lại" onPress={() => void onReload?.()} />}
    </View>
  );
}
