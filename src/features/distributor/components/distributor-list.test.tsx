import { fireEvent, render, screen } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { useProvinces } from '@/features/location';
import { NEARBY_FALLBACK_NOTES } from '../constants/distributor.constants';
import type { useNearbyDistributors } from '../hooks/use-nearby-distributors';
import { nearbyDistributor, nearbyView } from '../test/distributor.fixtures';
import type { TNearbyDistributorsView } from '../types/distributor.types';
import { DistributorList } from './distributor-list';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/features/location', () => ({ useProvinces: jest.fn() }));
jest.mock('../hooks/use-distributor-profile', () => ({ useDistributorProfile: jest.fn(() => ({ data: undefined })) }));

type TQuery = ReturnType<typeof useNearbyDistributors>;

const query = (data: TNearbyDistributorsView) =>
  ({
    data,
    isPending: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }) as unknown as TQuery;

const TWO = nearbyView({
  items: [nearbyDistributor({ userId: 'd1' }), nearbyDistributor({ userId: 'd2', username: 'Cửa hàng Bình An' })],
  total: 2,
});

describe('DistributorList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useProvinces).mockReturnValue({
      data: [{ codename: 'ha_noi', name: 'Hà Nội' }],
    } as unknown as ReturnType<typeof useProvinces>);
  });

  it('resolves province names; card → /profile/<userId>', async () => {
    await render(<DistributorList query={query(TWO)} selectedId={null} />);
    expect(screen.getAllByText('Hà Nội · 1,2 km')).toHaveLength(2);
    await fireEvent.press(screen.getByText('Cửa hàng Bình An'));
    expect(mockPush).toHaveBeenCalledWith('/profile/d2');
  });

  it('map selection → card highlighted and scrolled into view', async () => {
    const scrollToIndex = jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
    const { rerender } = await render(<DistributorList query={query(TWO)} selectedId={null} />);
    await rerender(<DistributorList query={query(TWO)} selectedId="d2" />);
    expect(scrollToIndex).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }));
    expect(screen.getByRole('button', { selected: true })).toHaveTextContent(/Cửa hàng Bình An/);
    scrollToIndex.mockRestore();
  });

  it('nobody in the radius → "nearest" note', async () => {
    await render(<DistributorList query={query(nearbyView({ scope: 'nationwide_by_distance' }))} selectedId={null} />);
    expect(screen.getByText(NEARBY_FALLBACK_NOTES.nationwide_by_distance)).toBeOnTheScreen();
  });

  it('province without distributors → nationwide note; no location at all → no note', async () => {
    const { rerender } = await render(
      <DistributorList query={query(nearbyView({ scope: 'nationwide', source: 'query_area' }))} selectedId={null} />,
    );
    expect(screen.getByText(NEARBY_FALLBACK_NOTES.nationwide)).toBeOnTheScreen();

    await rerender(
      <DistributorList query={query(nearbyView({ scope: 'nationwide', source: 'none' }))} selectedId={null} />,
    );
    expect(screen.queryByText(NEARBY_FALLBACK_NOTES.nationwide)).toBeNull();
  });

  it('empty result → empty state', async () => {
    await render(<DistributorList query={query(nearbyView({ items: [], total: 0 }))} selectedId={null} />);
    expect(screen.getByText('Chưa có nhà phân phối')).toBeOnTheScreen();
  });
});
