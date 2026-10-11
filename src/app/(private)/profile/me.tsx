import { Redirect } from "expo-router";
import { useSession } from "@/features/auth";
import { AccountHeaderActions, FarmerProfileInfo } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";

/**
 * Own profile "/profile/me" (private — no id in the URL, so only the logged-in user sees it). FARMER: info + Chỉnh sửa
 * (M6) + addresses (M7), layout of ui-ux.md §7 without tabs. DISTRIBUTOR → their public profile (with tabs).
 */
export default function MyProfileScreen() {
  const { user } = useSession();
  if (user?.role === "DISTRIBUTOR")
    return <Redirect href={ROUTES.profile(user.id)} />;
  return (
    <ProfileLayout
      header={<SiteHeader actions={<AccountHeaderActions />} />}
      body={<FarmerProfileInfo />}
    />
  );
}
