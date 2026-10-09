import { notification, notificationsCache, notificationsPage } from '../test/notification.fixtures';
import { markReadInCache, prependNotification } from './notification-cache.util';

describe('markReadInCache', () => {
  it('marks only the matching unread items, across pages, without mutating the input', () => {
    const cache = notificationsCache(
      notificationsPage({ notifications: [notification({ id: 'n1' }), notification({ id: 'n2' })], nextCursor: 'c1' }),
      notificationsPage({ notifications: [notification({ id: 'n3' })] }),
    );
    const next = markReadInCache(cache, (item) => item.id !== 'n2');

    expect(next?.pages.flatMap((page) => page.notifications.map((item) => item.isRead))).toEqual([true, false, true]);
    expect(cache.pages[0]?.notifications[0]?.isRead).toBe(false);
  });

  it('keeps already-read items as the same object; undefined cache → undefined', () => {
    const read = notification({ isRead: true });
    const next = markReadInCache(notificationsCache(notificationsPage({ notifications: [read] })), () => true);
    expect(next?.pages[0]?.notifications[0]).toBe(read);
    expect(markReadInCache(undefined, () => true)).toBeUndefined();
  });
});

describe('prependNotification', () => {
  it('adds at the top of page 0', () => {
    const cache = notificationsCache(notificationsPage({ notifications: [notification({ id: 'n1' })] }));
    const next = prependNotification(cache, notification({ id: 'n2' }));
    expect(next?.pages[0]?.notifications.map((item) => item.id)).toEqual(['n2', 'n1']);
  });

  it('no-op when the id is already loaded, or nothing is loaded', () => {
    const cache = notificationsCache(notificationsPage({ notifications: [notification({ id: 'n1' })] }));
    expect(prependNotification(cache, notification({ id: 'n1' }))).toBe(cache);
    expect(prependNotification(undefined, notification())).toBeUndefined();
    const empty = notificationsCache();
    expect(prependNotification(empty, notification())).toBe(empty);
  });
});
