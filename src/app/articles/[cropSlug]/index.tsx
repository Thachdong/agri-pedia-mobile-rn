import { useLocalSearchParams } from 'expo-router';
import { EmptyState } from '@/shared/components/molecules';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Articles of one crop "/articles/<cropSlug>" — public. MOCK: out of the home scope (Specs/19102026), no API yet. */
export default function CropArticlesScreen() {
  const { cropSlug } = useLocalSearchParams<{ cropSlug: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Bài viết bệnh cây trồng" />}>
      <EmptyState
        icon="newspaper-outline"
        title="Tính năng đang phát triển"
        description={`Danh sách bài viết (${cropSlug}) sẽ sớm có trên ứng dụng.`}
        className="flex-1"
      />
    </ScreenLayout>
  );
}
