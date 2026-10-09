import { useNavigation, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useSession } from '@/features/auth';
import { findDistributorReviewQuery } from '@/features/review';
import { useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { toast } from '@/shared/lib/toast';
import { NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE } from '../constants/notification.constants';
import type { TNotification } from '../types/notification.types';
import { getReviewTargetRoute } from '../utils/notification-target.util';
import { useMarkNotificationRead } from './use-mark-notification-read';

type TResolveReviewVariables = { notificationId: string; reviewId: string; distributorId: string };

/**
 * Tap on a notification: unread → mark read (optimistic). REVIEW → find the review (`referenceId`) among the
 * recipient's shop reviews and open its target (shop profile / product page); not found → toast. PLATFORM → nothing more.
 * `openingId`: id of the REVIEW notification being resolved (item shows busy). Lookup errors → global toast.
 * Left the screen before the lookup ended → no navigation.
 */
export function useOpenNotification() {
  const router = useRouter();
  const navigation = useNavigation();
  const client = useAppQueryClient();
  const userId = useSession().user?.id;
  const { mutate: markRead } = useMarkNotificationRead();

  const resolve = useAppMutation({
    mutationFn: ({ reviewId, distributorId }: TResolveReviewVariables) =>
      client.fetchQuery(findDistributorReviewQuery({ distributorId, reviewId })),
    invalidates: false,
    onSuccess: (review, { distributorId }) => {
      if (!navigation.isFocused()) return;
      if (!review) {
        toast.info(NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE);
        return;
      }
      router.push(getReviewTargetRoute(review, distributorId));
    },
  });
  const { mutate: resolveReview, isPending: isResolving } = resolve;

  const open = useCallback(
    (notification: TNotification) => {
      if (!notification.isRead) markRead(notification.id);
      if (notification.type !== 'REVIEW' || isResolving) return;
      if (!notification.referenceId || !userId) {
        toast.info(NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE);
        return;
      }
      resolveReview({ notificationId: notification.id, reviewId: notification.referenceId, distributorId: userId });
    },
    [markRead, resolveReview, isResolving, userId],
  );

  return { open, openingId: isResolving ? resolve.variables?.notificationId : undefined };
}
