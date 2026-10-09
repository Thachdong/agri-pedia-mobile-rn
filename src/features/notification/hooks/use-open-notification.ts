import { useRouter } from 'expo-router';
import { useSession } from '@/features/auth';
import { findDistributorReviewQuery } from '@/features/review';
import { useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { toast } from '@/shared/lib/toast';
import { NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE } from '../constants/notification.constants';
import type { TNotification } from '../types/notification.types';
import { getReviewTargetRoute } from '../utils/notification-target.util';
import { useMarkNotificationRead } from './use-mark-notification-read';

/**
 * Tap on a notification: unread → mark read (optimistic). REVIEW → find the review (`referenceId`) among the
 * recipient's shop reviews and open its target (shop profile / product page); not found → toast. PLATFORM → nothing more.
 * `openingId`: the REVIEW notification being resolved (item shows busy). Lookup errors → global toast.
 */
export function useOpenNotification() {
  const router = useRouter();
  const client = useAppQueryClient();
  const session = useSession();
  const markRead = useMarkNotificationRead();

  const resolve = useAppMutation({
    mutationFn: ({ reviewId, distributorId }: { reviewId: string; distributorId: string }) =>
      client.fetchQuery(findDistributorReviewQuery({ distributorId, reviewId })),
    invalidates: false,
    onSuccess: (review, { distributorId }) => {
      if (!review) {
        toast.info(NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE);
        return;
      }
      router.push(getReviewTargetRoute(review, distributorId));
    },
  });

  const open = (notification: TNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.type !== 'REVIEW' || resolve.isPending) return;
    if (!notification.referenceId || !session.user) {
      toast.info(NOTIFICATION_REVIEW_NOT_FOUND_MESSAGE);
      return;
    }
    resolve.mutate({ reviewId: notification.referenceId, distributorId: session.user.id });
  };

  return { open, openingId: resolve.isPending ? resolve.variables?.reviewId : undefined };
}
