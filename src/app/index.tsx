import { AccountHeaderActions } from '@/features/user';
import { EmptyState } from '@/shared/components/molecules';
import { SiteHeader } from '@/shared/components/organisms';
import { MapListLayout } from '@/shared/components/templates';
import { AppMap } from '@/shared/lib/map';

/**
 * Home "/" (ui-ux.md §6, image-4) — public. Layout only: (1)–(4) header by session, (5) map centered on VN,
 * (6) filter and (7) distributor list are placeholders until GET /distributors/nearby is wired.
 */
export default function HomeScreen() {
  return (
    <MapListLayout
      header={<SiteHeader actions={<AccountHeaderActions />} />}
      map={<AppMap accessibilityLabel="Bản đồ nhà phân phối" className="flex-1" />}
      filters={<EmptyState icon="options-outline" title="Tìm kiếm và bộ lọc" className="py-0" />}
      list={<EmptyState icon="storefront-outline" title="Chưa có nhà phân phối" />}
    />
  );
}
