import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppError } from '@/shared/lib/http';
import { InfiniteList, type TInfiniteListQuery } from './infinite-list';

type TRow = { id: string; name: string };

const query = (overrides: Partial<TInfiniteListQuery> = {}): TInfiniteListQuery => ({
  isPending: false,
  isError: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const ROWS: TRow[] = [
  { id: 'a', name: 'Hàng A' },
  { id: 'b', name: 'Hàng B' },
];

const renderList = (q: TInfiniteListQuery, items: TRow[] = ROWS) =>
  render(
    <InfiniteList
      query={q}
      items={items}
      keyExtractor={(row) => row.id}
      renderItem={(row) => <Text>{row.name}</Text>}
      emptyTitle="Không có gì"
      accessibilityLabel="Danh sách"
    />,
  );

describe('InfiniteList', () => {
  it('first page loading → spinner, no rows', async () => {
    await renderList(query({ isPending: true }));
    expect(screen.getByLabelText('Đang tải')).toBeOnTheScreen();
    expect(screen.queryByText('Hàng A')).toBeNull();
  });

  it('first page error → mapped message + retry refetches', async () => {
    const q = query({ isError: true, error: new AppError({ status: 400, code: 'USER_LOCATION_INVALID', message: 'x' }) });
    await renderList(q, []);
    expect(screen.getByText('Không tải được dữ liệu')).toBeOnTheScreen();
    expect(screen.getByText('Tỉnh/thành phố hoặc phường/xã không hợp lệ. Vui lòng chọn lại.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }));
    expect(q.refetch).toHaveBeenCalled();
  });

  it('empty result → empty title', async () => {
    await renderList(query(), []);
    expect(screen.getByText('Không có gì')).toBeOnTheScreen();
  });

  it('end reached with a next page → fetches it', async () => {
    const q = query({ hasNextPage: true });
    await renderList(q);
    await fireEvent(screen.getByLabelText('Danh sách'), 'endReached');
    expect(q.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('end reached while the next page loads → no second request, footer spinner', async () => {
    const q = query({ hasNextPage: true, isFetchingNextPage: true });
    await renderList(q);
    await fireEvent(screen.getByLabelText('Danh sách'), 'endReached');
    expect(q.fetchNextPage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Đang tải thêm')).toBeOnTheScreen();
  });

  it('end reached on the last page → nothing', async () => {
    const q = query({ hasNextPage: false });
    await renderList(q);
    await fireEvent(screen.getByLabelText('Danh sách'), 'endReached');
    expect(q.fetchNextPage).not.toHaveBeenCalled();
  });

  it('next page failed → rows kept, inline retry fetches the next page (no auto loop)', async () => {
    const q = query({ hasNextPage: true, isFetchNextPageError: true });
    await renderList(q);
    expect(screen.getByText('Hàng A')).toBeOnTheScreen();
    await fireEvent(screen.getByLabelText('Danh sách'), 'endReached');
    expect(q.fetchNextPage).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }));
    expect(q.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('numColumns → grid rows', async () => {
    await render(
      <InfiniteList
        query={query()}
        items={ROWS}
        keyExtractor={(row) => row.id}
        renderItem={(row) => <Text>{row.name}</Text>}
        emptyTitle="Không có gì"
        numColumns={2}
        accessibilityLabel="Lưới"
      />,
    );
    // Grid: both items sit in one row view (a plain list gives each its own cell).
    const rowOf = (name: string) => screen.getByText(name).parent;
    expect(rowOf('Hàng A')).toBe(rowOf('Hàng B'));
    expect(rowOf('Hàng A')).toBeTruthy();
  });
});

