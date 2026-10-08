import { act, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { mockMapCamera } from '@/test-utils/react-native-maps.mock';
import { AppMap, type TAppMapHandle } from './app-map';
import { MAP_ZOOM, VN_BOUNDS } from './map.constants';

const HOME = { lat: 21.03, long: 105.82 };
const mapReady = () => act(() => screen.getByTestId('map-view').props.onMapReady());

describe('AppMap camera', () => {
  beforeEach(() => jest.clearAllMocks());

  it('no initial center → frames mainland VN when the map is ready', async () => {
    await render(<AppMap />);
    expect(mockMapCamera.fitToCoordinates).not.toHaveBeenCalled();
    await mapReady();
    expect(mockMapCamera.fitToCoordinates).toHaveBeenCalledWith(
      VN_BOUNDS.map(({ lat, long }) => ({ latitude: lat, longitude: long })),
      expect.objectContaining({ animated: false }),
    );
  });

  it('a move asked before ready (cached data on remount) runs on ready instead of the country frame', async () => {
    const ref = createRef<TAppMapHandle>();
    await render(<AppMap ref={ref} />);
    await act(() => ref.current?.animateTo(HOME, MAP_ZOOM.province));
    expect(mockMapCamera.animateToRegion).not.toHaveBeenCalled();

    await mapReady();
    expect(mockMapCamera.animateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: HOME.lat, longitude: HOME.long, latitudeDelta: MAP_ZOOM.province }),
      0,
    );
    expect(mockMapCamera.fitToCoordinates).not.toHaveBeenCalled();
  });

  it('after ready → moves right away, animated', async () => {
    const ref = createRef<TAppMapHandle>();
    await render(<AppMap ref={ref} />);
    await mapReady();
    jest.clearAllMocks();
    await act(() => ref.current?.animateTo(HOME, MAP_ZOOM.province));
    expect(mockMapCamera.animateToRegion).toHaveBeenCalledWith(expect.objectContaining({ latitude: HOME.lat }), undefined);
  });
});
