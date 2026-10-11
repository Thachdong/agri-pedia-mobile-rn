import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { DistributorProfileInfo, DistributorProfileTabs } from '@/features/distributor';
import { AccountHeaderActions } from '@/features/user';
import { SiteHeader } from '@/shared/components/organisms';
import { ProfileLayout } from '@/shared/components/templates';

/**
 * Distributor profile "/profile/<id>" (ui-ux.md §7, image-5 / image-6) — public. Header as "/", info and tabs.
 */
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ProfileLayout
      header={<SiteHeader actions={<AccountHeaderActions />} />}
      body={
        <ScrollView>
          <View className="gap-6 px-4 py-6">
            <DistributorProfileInfo distributorId={id} />
            <DistributorProfileTabs />
          </View>
        </ScrollView>
      }
    />
  );
}
