import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { EmptyState } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { getErrorMessage, isAppError } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';
import { colors } from '@/shared/theme';
import { DIAGNOSIS_ERROR_CODE } from '../constants/diagnosis.constants';
import { useDiagnosisLive } from '../hooks/use-diagnosis-live';
import { DiagnosisReportView } from './diagnosis-report-view';
import { DiagnosisStatusPanel } from './diagnosis-status-panel';

export type TDiagnosisResultProps = {
  id: string;
  /** Under the title (e.g. "Gửi báo cáo"). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Result screen body (Specs/19102026): waits for the result (realtime + polling) → summary → each image →
 * disclaimer. Unknown / someone else's diagnosis → not found. Pull to refresh.
 */
export function DiagnosisResult({ id, actions, className }: TDiagnosisResultProps) {
  const router = useRouter();
  const query = useDiagnosisLive(id);
  // Own flag: `isRefetching` is also true on every poll — the pull spinner shows only for a pull.
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await query.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (query.isPending) {
    return (
      <View accessibilityLabel="Đang tải kết quả chẩn đoán" className={cn('gap-4 p-4', className)}>
        <View className="h-7 w-2/3 rounded bg-surface" />
        <View className="h-32 rounded-xl bg-surface" />
        <View className="h-72 rounded-xl bg-surface" />
      </View>
    );
  }

  if (query.isError) {
    const notFound = isAppError(query.error) && query.error.code === DIAGNOSIS_ERROR_CODE.notFound;
    return notFound ? (
      <EmptyState
        icon="search-outline"
        title="Không tìm thấy kết quả chẩn đoán"
        action={<Button label="Về trang chủ" variant="outline" size="sm" onPress={() => router.replace(ROUTES.home)} />}
        className={cn('flex-1', className)}
      />
    ) : (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tải được kết quả chẩn đoán"
        description={getErrorMessage(query.error)}
        action={<Button label="Thử lại" variant="outline" size="sm" onPress={() => void query.refetch()} />}
        className={cn('flex-1', className)}
      />
    );
  }

  return (
    <ScrollView
      className={cn('flex-1', className)}
      contentContainerClassName="p-4 pb-8"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void onRefresh()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <DiagnosisReportView diagnosis={query.data} actions={actions}>
        <DiagnosisStatusPanel diagnosis={query.data} timedOut={query.timedOut} onReload={query.reload} />
      </DiagnosisReportView>
    </ScrollView>
  );
}
