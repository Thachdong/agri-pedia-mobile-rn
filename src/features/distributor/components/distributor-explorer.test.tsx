import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { useProvinces } from '@/features/location';
import { getCurrentPosition } from '@/shared/lib/device';
import { useNearbyDistributors } from '../hooks/use-nearby-distributors';
import { nearbyDistributor, nearbyView } from '../test/distributor.fixtures';
import { DistributorExplorerFilter, DistributorExplorerMap, DistributorExplorerProvider } from './distributor-explorer';

const mockFitTo = jest.fn();

type TMockMapProps = {
  ref?: unknown;
  markers: { id: string }[];
  selectedId: string | null;
  onMarkerPress: (id: string) => void;
};

jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/location', () => ({ useProvinces: jest.fn() }));
jest.mock('@/shared/lib/device', () => ({ getCurrentPosition: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { error: jest.fn() } }));
jest.mock('../hooks/use-nearby-distributors', () => ({ useNearbyDistributors: jest.fn() }));
// Map → markers as pressable texts + a handle whose fitTo is observable.
jest.mock('@/shared/lib/map', () => {
  const { useImperativeHandle } = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AppMap: ({ ref, markers, selectedId, onMarkerPress }: TMockMapProps) => {
      useImperativeHandle(ref as never, () => ({ fitTo: mockFitTo, animateTo: jest.fn() }));
      return markers.map((marker) => (
        <Text key={marker.id} onPress={() => onMarkerPress(marker.id)}>
          {`marker:${marker.id}${marker.id === selectedId ? ':selected' : ''}`}
        </Text>
      ));
    },
  };
});

const HERE = { lat: 10.77, long: 106.7 };
const HOME = { lat: 21.03, long: 105.82 };

const renderExplorer = () =>
  render(
    <DistributorExplorerProvider>
      <DistributorExplorerMap />
      <DistributorExplorerFilter />
    </DistributorExplorerProvider>,
  );

describe('DistributorExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      user: { id: 'f1', role: 'FARMER', address: { province: 'ha_noi', ward: 'ba_dinh', houseNumber: '1', ...HOME } },
      isLoggedIn: true,
    } as unknown as ReturnType<typeof useSession>);
    jest.mocked(useProvinces).mockReturnValue({ data: [], isPending: false, isError: false } as unknown as ReturnType<
      typeof useProvinces
    >);
    // Every filter answers at once (as if cached) with the same distributor.
    jest.mocked(useNearbyDistributors).mockReturnValue({
      data: nearbyView({ items: [nearbyDistributor({ userId: 'd1' })] }),
      isSuccess: true,
    } as unknown as ReturnType<typeof useNearbyDistributors>);
    jest.mocked(getCurrentPosition).mockResolvedValue(HERE);
  });

  it('logged in → no location sent; map framed on the result + own address', async () => {
    await renderExplorer();
    expect(useNearbyDistributors).toHaveBeenLastCalledWith({}, { enabled: true });
    expect(mockFitTo).toHaveBeenCalledTimes(1);
    expect(mockFitTo).toHaveBeenLastCalledWith([HOME, { lat: 21.03, long: 105.82 }]);
  });

  it('re-frames on every filter change, also when "Xoá lọc" returns to the default', async () => {
    await renderExplorer();
    await fireEvent.press(screen.getByRole('button', { name: 'Gần tôi' }));
    await act(async () => {});
    expect(useNearbyDistributors).toHaveBeenLastCalledWith({ lat: HERE.lat, long: HERE.long }, { enabled: true });
    expect(mockFitTo).toHaveBeenCalledTimes(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Xoá lọc' }));
    expect(useNearbyDistributors).toHaveBeenLastCalledWith({}, { enabled: true });
    expect(mockFitTo).toHaveBeenCalledTimes(3);
  });

  it('marker press selects it; a new filter clears the selection', async () => {
    await renderExplorer();
    await fireEvent.press(screen.getByText('marker:d1'));
    expect(screen.getByText('marker:d1:selected')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Gần tôi' }));
    await act(async () => {});
    expect(screen.getByText('marker:d1')).toBeOnTheScreen();
  });
});
