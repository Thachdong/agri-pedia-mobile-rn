import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DistributorCard,
  useNearbyDistributors,
  type TNearbyDistributor,
  type TNearbyDistributorsParams,
} from '@/features/distributor';
import { useProvinces, useWards } from '@/features/location';
import { Button } from '@/shared/components/atoms';
import { EmptyState, SegmentedControl, SelectField } from '@/shared/components/molecules';
import { getCurrentPosition } from '@/shared/lib/device';
import { getErrorMessage } from '@/shared/lib/http';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import type { TGeoPoint } from '@/shared/types';

type TSearchMode = 'nearby' | 'area';

const MODES = [
  { value: 'nearby', label: 'Gần tôi' },
  { value: 'area', label: 'Theo tỉnh thành' },
] as const;

/** Every ward of the province (no ward filter). */
const ALL_WARDS = '__all__';

export type TFindSupplierSheetProps = {
  sheetRef: TAppSheetProps['sheetRef'];
  /** True while presented — the search (location prompt, request) runs only then. */
  active: boolean;
  onClose: () => void;
  /** Distributor chosen (the caller confirms, then sends the report). */
  onChoose: (distributor: TNearbyDistributor) => void;
};

/**
 * "Tìm nhà cung cấp" (Specs/19102026 farmer.md): "Gần tôi" (device position) | "Theo tỉnh thành" (province + optional
 * ward) → GET /distributors/nearby. Nobody in range → the server answers nationwide, noted above the list.
 */
export function FindSupplierSheet({ sheetRef, active, onClose, onChoose }: TFindSupplierSheetProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<TSearchMode>('nearby');

  return (
    <AppSheet
      sheetRef={sheetRef}
      scrollable
      snapPoints={['85%']}
      accessibilityLabel="Tìm nhà cung cấp"
      onDismiss={onClose}
    >
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <View className="gap-1">
          <Text accessibilityRole="header" className={TEXT.titleMedium}>
            Tìm nhà cung cấp
          </Text>
          <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Chọn nhà cung cấp để gửi báo cáo chẩn đoán.</Text>
        </View>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} accessibilityLabel="Cách tìm" />
        {/* Mounted per tab while open: switching tabs drops the other search. */}
        {active &&
          (mode === 'nearby' ? (
            <NearbySearch onChoose={onChoose} onSearchByArea={() => setMode('area')} />
          ) : (
            <AreaSearch onChoose={onChoose} />
          ))}
      </View>
    </AppSheet>
  );
}

type TSearchProps = { onChoose: (distributor: TNearbyDistributor) => void };

function NearbySearch({ onChoose, onSearchByArea }: TSearchProps & { onSearchByArea: () => void }) {
  const [point, setPoint] = useState<TGeoPoint | null>(null);
  const [status, setStatus] = useState<'locating' | 'done' | 'failed'>('locating');

  const locate = async () => {
    setStatus('locating');
    const position = await getCurrentPosition();
    setPoint(position);
    setStatus(position ? 'done' : 'failed');
  };

  // Ask the position as soon as the tab shows.
  useEffect(() => {
    let active = true;
    void getCurrentPosition().then((position) => {
      if (!active) return;
      setPoint(position);
      setStatus(position ? 'done' : 'failed');
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === 'locating') {
    return (
      <View className="items-center gap-2 py-6" accessibilityLabel="Đang lấy vị trí">
        <ActivityIndicator color={colors.primary} />
        <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>Đang lấy vị trí của bạn…</Text>
      </View>
    );
  }
  if (status === 'failed' || !point) {
    return (
      <View accessibilityRole="alert" className="gap-3 rounded-lg bg-warning-subtle p-3">
        <Text className={cn(TEXT.bodyMedium, 'text-warning')}>
          Không lấy được vị trí. Hãy bật định vị và cho phép ứng dụng dùng vị trí, hoặc tìm theo tỉnh thành.
        </Text>
        <View className="flex-row gap-2">
          <Button label="Thử lại" variant="outline" size="sm" onPress={() => void locate()} className="flex-1" />
          <Button label="Tìm theo tỉnh thành" variant="outline" size="sm" onPress={onSearchByArea} className="flex-1" />
        </View>
      </View>
    );
  }
  return <SupplierResults params={{ lat: point.lat, long: point.long }} onChoose={onChoose} />;
}

function AreaSearch({ onChoose }: TSearchProps) {
  const provinces = useProvinces();
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [wardCode, setWardCode] = useState<string>(ALL_WARDS);
  const wards = useWards(provinceCode ?? undefined);

  const wardOptions = useMemo(
    () => [
      { value: ALL_WARDS, label: 'Tất cả phường/xã' },
      ...(wards.data ?? []).map(({ codename, name }) => ({ value: codename, label: name })),
    ],
    [wards.data],
  );

  return (
    <View className="gap-3">
      <SelectField
        label="Tỉnh/thành phố"
        options={(provinces.data ?? []).map(({ codename, name }) => ({ value: codename, label: name }))}
        value={provinceCode}
        onChange={(code) => {
          setProvinceCode(code);
          setWardCode(ALL_WARDS);
        }}
        placeholder="Chọn tỉnh/thành phố"
        loading={provinces.isPending}
        error={provinces.isError ? getErrorMessage(provinces.error) : undefined}
        onRetry={() => void provinces.refetch()}
      />
      <SelectField
        label="Phường/xã (không bắt buộc)"
        options={wardOptions}
        value={wardCode}
        onChange={setWardCode}
        disabled={!provinceCode}
        loading={!!provinceCode && wards.isPending}
        emptyText="Chọn tỉnh/thành phố trước"
      />
      {provinceCode ? (
        <SupplierResults
          params={wardCode === ALL_WARDS ? { provinceCode } : { provinceCode, wardCode }}
          onChoose={onChoose}
        />
      ) : (
        <Text className={cn(TEXT.bodyMedium, 'text-center text-muted-foreground')}>
          Chọn tỉnh/thành phố để xem nhà cung cấp.
        </Text>
      )}
    </View>
  );
}

function SupplierResults({ params, onChoose }: TSearchProps & { params: TNearbyDistributorsParams }) {
  const query = useNearbyDistributors(params);
  const provinces = useProvinces();
  const provinceNames = useMemo(
    () => new Map(provinces.data?.map(({ codename, name }) => [codename, name])),
    [provinces.data],
  );

  if (query.isPending) {
    return (
      <View className="items-center py-6" accessibilityLabel="Đang tải">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (query.isError) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tải được nhà cung cấp"
        description={getErrorMessage(query.error)}
        action={<Button label="Thử lại" variant="outline" size="sm" onPress={() => void query.refetch()} />}
      />
    );
  }

  const { items, scope } = query.data;
  const fallback = scope === 'nationwide_by_distance' || ('provinceCode' in params && scope === 'nationwide');

  if (items.length === 0) {
    return <EmptyState icon="storefront-outline" title="Chưa có nhà cung cấp" />;
  }
  return (
    <View className="gap-2">
      {fallback && (
        <View className="rounded-lg bg-highlight-subtle px-3 py-2">
          <Text className={cn(TEXT.bodySmall, 'text-foreground')}>
            Không có nhà cung cấp trong khu vực, đang hiển thị nhà cung cấp trên toàn quốc.
          </Text>
        </View>
      )}
      {items.map((distributor) => (
        <DistributorCard
          key={distributor.userId}
          distributor={distributor}
          provinceName={provinceNames.get(distributor.address.province) ?? null}
          onPress={onChoose}
        />
      ))}
      {query.hasNextPage && (
        <Button
          label={query.isFetchNextPageError ? 'Tải thêm thất bại — thử lại' : 'Xem thêm'}
          variant="ghost"
          size="sm"
          loading={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
        />
      )}
    </View>
  );
}
