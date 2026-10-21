import { View } from 'react-native';
import { TopArticlesSection } from '@/features/article';
import { useSession } from '@/features/auth';
import { HomeDiagnosisPanel } from '@/features/diagnosis';
import {
  DistributorExplorerList,
  DistributorExplorerProvider,
  DistributorExplorerSection,
} from '@/features/distributor';
import { AccountHeaderActions } from '@/features/user';
import { SiteHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/**
 * Home "/" (Specs/19102026) — public, one vertical scroll: diagnosis form → top articles → distributors (map + filter
 * + list; the map starts when scrolled to). The distributor list is the scroll, the other blocks are its header.
 * - Guest: form with the default crop, any use → login sheet; header without chat / notification / user.
 * - FARMER: everything usable.
 * - DISTRIBUTOR: same, its own shop pinned first and the other shops not openable.
 */
export default function HomeScreen() {
  const session = useSession();
  const ownShopId =
    session.status === 'authenticated' && session.user.role === 'DISTRIBUTOR' ? session.user.id : undefined;

  return (
    <ScreenLayout header={<SiteHeader actions={<AccountHeaderActions />} />}>
      <DistributorExplorerProvider ownShopId={ownShopId}>
        <DistributorExplorerList
          header={
            // DistributorExplorerSection must stay a direct child of this root (its layout y = scroll offset).
            <View className="gap-6 pb-2">
              <HomeDiagnosisPanel guest={session.status === 'guest'} />
              <TopArticlesSection />
              <DistributorExplorerSection />
            </View>
          }
        />
      </DistributorExplorerProvider>
    </ScreenLayout>
  );
}
