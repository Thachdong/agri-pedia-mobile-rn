import { Component } from 'react';
import { View, type ViewProps } from 'react-native';

/** Camera calls of every MapView instance — assert on these (reset in `beforeEach`). */
export const mockMapCamera = {
  animateToRegion: jest.fn(),
  fitToCoordinates: jest.fn(),
};

/** jest mock of react-native-maps: MapView keeps its props, so tests fire `press` with `{ nativeEvent: { coordinate } }`. */
class MapView extends Component<ViewProps> {
  animateToRegion = mockMapCamera.animateToRegion;
  fitToCoordinates = mockMapCamera.fitToCoordinates;

  override render() {
    return <View testID="map-view" {...this.props} />;
  }
}

export function Marker(props: ViewProps) {
  return <View testID="map-marker" {...props} />;
}

export function UrlTile() {
  return null;
}

// eslint-disable-next-line import/no-default-export -- mirrors the library's default export
export default MapView;
