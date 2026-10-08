import { Text, View } from 'react-native';
import { useSession } from '@/features/auth';
import { Button } from '@/shared/components/atoms';
import { InfoTable, type TInfoTableItem } from '@/shared/components/molecules';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TDistributorProfileInfoProps = {
  distributorId: string;
  className?: string;
};

// Layout only: values come with GET /distributors/:id (next task) — empty rows show InfoTable's "Chưa cập nhật".
const ROWS: readonly TInfoTableItem[] = [
  { id: 'contact', label: 'Email / Phone' },
  { id: 'license', label: 'Giấy phép kinh doanh' },
  { id: 'address', label: 'Địa chỉ' },
  { id: 'businessType', label: 'Lĩnh vực kinh doanh' },
  { id: 'bio', label: 'Giới thiệu' },
];

/**
 * Distributor info (ui-ux.md §7, image-5): title + (5) Chat + info table. Chat is hidden on one's own profile;
 * hidden too while the session loads. It has no action yet (M1 / M2 come with the chat feature).
 */
export function DistributorProfileInfo({ distributorId, className }: TDistributorProfileInfoProps) {
  const session = useSession();
  // Unknown viewer while the session loads → no Chat yet, so it never flashes on one's own profile.
  const showChat = session.status !== 'loading' && session.user?.id !== distributorId;

  return (
    <View className={cn('gap-4', className)}>
      <View className="flex-row items-center justify-between gap-3">
        <Text accessibilityRole="header" numberOfLines={2} className={cn(TEXT.titleLarge, 'flex-1')}>
          Nhà phân phối
        </Text>
        {showChat && <Button label="Chat" variant="outline" size="sm" />}
      </View>
      <InfoTable items={ROWS} />
    </View>
  );
}
