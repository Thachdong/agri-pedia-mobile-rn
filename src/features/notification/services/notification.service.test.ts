import { http } from '@/shared/lib/http';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_PAGE_SIZE,
} from './notification.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn(), patch: jest.fn() } }));

describe('notification.service', () => {
  beforeEach(() => {
    jest.mocked(http.get).mockReset().mockResolvedValue({});
    jest.mocked(http.patch).mockReset().mockResolvedValue(undefined);
  });

  it('GET /notifications with cursor + page size and the abort signal', async () => {
    const { signal } = new AbortController();
    await getNotifications('c1', signal);
    expect(http.get).toHaveBeenCalledWith('/notifications', {
      query: { cursor: 'c1', limit: NOTIFICATIONS_PAGE_SIZE },
      signal,
    });
  });

  it('PATCH /notifications/{id}/read with the id encoded', async () => {
    await markNotificationRead('a/b');
    expect(http.patch).toHaveBeenCalledWith('/notifications/a%2Fb/read');
  });

  it('PATCH /notifications/read-all', async () => {
    await markAllNotificationsRead();
    expect(http.patch).toHaveBeenCalledWith('/notifications/read-all');
  });
});
