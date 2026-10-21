import { useLocalSearchParams } from 'expo-router';
import { useSession } from '@/features/auth';
import { ChatWithUser } from '@/features/chat';
import { useDistributorProfile } from '@/features/distributor';
import { SCREEN_HEADER_HEIGHT, ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Chat with a distributor — opened from the profile "Chat" button (ui-ux.md §7 M2, a screen on mobile). */
export default function ChatWithUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const session = useSession();
  const { data: profile } = useDistributorProfile(userId);

  return (
    <ScreenLayout header={<ScreenHeader title={profile?.username ?? ''} />}>
      <ChatWithUser key={userId} userId={userId} currentUserId={session.user?.id ?? ''} headerHeight={SCREEN_HEADER_HEIGHT} />
    </ScreenLayout>
  );
}
