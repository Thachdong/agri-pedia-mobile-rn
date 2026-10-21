import { useLocalSearchParams } from 'expo-router';
import { EmptyState } from '@/shared/components/molecules';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Article detail "/articles/<cropSlug>/<slug>" — public. MOCK: out of the home scope (Specs/19102026), no API yet. */
export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ cropSlug: string; slug: string }>();
  return (
    <ScreenLayout header={<ScreenHeader title="Bài viết" />}>
      <EmptyState
        icon="document-text-outline"
        title="Tính năng đang phát triển"
        description={`Nội dung bài viết (${slug}) sẽ sớm có trên ứng dụng.`}
        className="flex-1"
      />
    </ScreenLayout>
  );
}
