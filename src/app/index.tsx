import { Redirect } from 'expo-router';
import { useSession } from '@/features/auth';
import {
  DistributorExplorerFilter,
  DistributorExplorerList,
  DistributorExplorerMap,
  DistributorExplorerProvider,
} from '@/features/distributor';
import { AccountHeaderActions } from '@/features/user';
import { SiteHeader } from '@/shared/components/organisms';
import { MapListLayout } from '@/shared/components/templates';
import { ROUTES } from '@/shared/constants';

/**
 * Home "/" (ui-ux.md §6, image-4) — public. (1)–(4) header by session, (5) map + (7) list from one nearby query keyed
 * by the (6) filter. A logged-in DISTRIBUTOR has no use for the search → own profile (same as web).
 */
export default function HomeScreen() {
  const session = useSession();

  if (session.status === 'authenticated' && session.user.role === 'DISTRIBUTOR') {
    return <Redirect href={ROUTES.profile(session.user.id)} />;
  }

  return (
    <DistributorExplorerProvider>
      <MapListLayout
        header={<SiteHeader actions={<AccountHeaderActions />} />}
        map={<DistributorExplorerMap className="flex-1" />}
        filters={<DistributorExplorerFilter />}
        list={<DistributorExplorerList />}
      />
    </DistributorExplorerProvider>
  );
}
