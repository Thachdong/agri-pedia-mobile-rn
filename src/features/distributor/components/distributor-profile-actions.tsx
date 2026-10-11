import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { LoginRequiredSheet, useSession } from '@/features/auth';
import { ReviewShopSheet, useDistributorReviews } from '@/features/review';
import { EditProfileSheet } from '@/features/user';
import { Button } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { useDistributorProfile } from '../hooks/use-distributor-profile';

export type TDistributorProfileActionsProps = { distributorId: string; className?: string };

/**
 * Buttons of the profile (ui-ux.md §7, decision 8): owner → Chỉnh sửa (M6) · FARMER → Chat (chat screen) + Đánh giá (M4;
 * own shop review already loaded → "Đã đánh giá", disabled) · guest → both open M1 · another DISTRIBUTOR → none
 * (chat is FARMER ↔ DISTRIBUTOR only, reviews FARMER only). Nothing while the session loads.
 */
export function DistributorProfileActions({ distributorId, className }: TDistributorProfileActionsProps) {
  const router = useRouter();
  const session = useSession();
  const { data: profile } = useDistributorProfile(distributorId);
  const { data: reviews } = useDistributorReviews({ distributorId });
  const loginSheet = useAppSheet();
  const reviewSheet = useAppSheet();
  const editSheet = useAppSheet();

  if (session.status === 'loading') return null;
  const { user } = session;

  if (user?.id === distributorId) {
    return (
      <View className={cn('flex-row', className)}>
        <Button label="Chỉnh sửa" variant="outline" size="sm" onPress={editSheet.open} />
        <EditProfileSheet sheetRef={editSheet.ref} onClose={editSheet.close} />
      </View>
    );
  }

  if (user && user.role !== 'FARMER') return null;

  const alreadyReviewed =
    !!user && !!reviews?.reviews.some((review) => review.targetType === 'USER' && review.user.id === user.id);
  const onChat = user ? () => router.push(ROUTES.chatWithUser(distributorId)) : loginSheet.open;
  const onReview = user ? reviewSheet.open : loginSheet.open;

  return (
    <View className={cn('flex-row gap-2', className)}>
      <Button label="Chat" variant="outline" size="sm" onPress={onChat} />
      <Button
        label={alreadyReviewed ? 'Đã đánh giá' : 'Đánh giá'}
        variant="highlight"
        size="sm"
        disabled={alreadyReviewed}
        onPress={onReview}
      />
      {user ? (
        <ReviewShopSheet
          sheetRef={reviewSheet.ref}
          onClose={reviewSheet.close}
          distributorId={distributorId}
          shopName={profile?.username ?? 'shop'}
        />
      ) : (
        <LoginRequiredSheet
          sheetRef={loginSheet.ref}
          onClose={loginSheet.close}
          description="Đăng nhập để chat hoặc đánh giá nhà phân phối."
        />
      )}
    </View>
  );
}
