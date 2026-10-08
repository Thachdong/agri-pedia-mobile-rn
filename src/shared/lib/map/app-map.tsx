import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile, type Region } from 'react-native-maps';
import { env } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import type { TGeoPoint } from '@/shared/types';
import { MAP_ZOOM, OSM_ATTRIBUTION, VN_CENTER } from './map.constants';

export type TMapMarker = {
  id: string;
  point: TGeoPoint;
  title?: string;
  draggable?: boolean;
};

/** Visible area: center + latitude span (longitude span follows the view's aspect ratio). */
export type TMapRegion = {
  center: TGeoPoint;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type TAppMapHandle = {
  /** Moves the camera to `point`; `latitudeDelta` defaults to street level. */
  animateTo: (point: TGeoPoint, latitudeDelta?: number) => void;
};

export type TAppMapProps = {
  ref?: Ref<TAppMapHandle>;
  /** Initial camera center — read once on mount (move later with `ref.animateTo`). Default: center of VN. */
  initialCenter?: TGeoPoint;
  /** Initial latitude span. Default: whole country. */
  initialLatitudeDelta?: number;
  markers?: readonly TMapMarker[];
  onPress?: (point: TGeoPoint) => void;
  onMarkerPress?: (id: string) => void;
  onMarkerDragEnd?: (id: string, point: TGeoPoint) => void;
  onRegionChangeComplete?: (region: TMapRegion) => void;
  className?: string;
  accessibilityLabel?: string;
};

type TLatLng = { latitude: number; longitude: number };

const toPoint = ({ latitude, longitude }: TLatLng): TGeoPoint => ({ lat: latitude, long: longitude });
const toRegion = (point: TGeoPoint, latitudeDelta: number): Region => ({
  latitude: point.lat,
  longitude: point.long,
  latitudeDelta,
  longitudeDelta: latitudeDelta,
});

/**
 * The only map of the app: react-native-maps + OSM tiles from `env.mapTileUrl` (shared decision 10).
 * Android → `mapType="none"` so only OSM tiles draw; iOS → tiles replace Apple Maps content.
 * Features never import react-native-maps; they pass plain `TGeoPoint` data.
 */
export function AppMap({
  ref,
  initialCenter = VN_CENTER,
  initialLatitudeDelta = MAP_ZOOM.country,
  markers = [],
  onPress,
  onMarkerPress,
  onMarkerDragEnd,
  onRegionChangeComplete,
  className,
  accessibilityLabel = 'Bản đồ',
}: TAppMapProps) {
  const mapRef = useRef<MapView>(null);
  const [initialRegion] = useState(() => toRegion(initialCenter, initialLatitudeDelta));

  useImperativeHandle(
    ref,
    () => ({
      animateTo: (point, latitudeDelta = MAP_ZOOM.street) => {
        mapRef.current?.animateToRegion(toRegion(point, latitudeDelta));
      },
    }),
    [],
  );

  return (
    <View className={cn('overflow-hidden', className)}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress ? (e) => onPress(toPoint(e.nativeEvent.coordinate)) : undefined}
        onRegionChangeComplete={
          onRegionChangeComplete
            ? (region) =>
                onRegionChangeComplete({
                  center: toPoint(region),
                  latitudeDelta: region.latitudeDelta,
                  longitudeDelta: region.longitudeDelta,
                })
            : undefined
        }
      >
        <UrlTile urlTemplate={env.mapTileUrl} maximumZ={19} flipY={false} shouldReplaceMapContent />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            identifier={marker.id}
            coordinate={{ latitude: marker.point.lat, longitude: marker.point.long }}
            title={marker.title}
            pinColor={colors.primary}
            draggable={marker.draggable}
            onPress={onMarkerPress ? () => onMarkerPress(marker.id) : undefined}
            onDragEnd={onMarkerDragEnd ? (e) => onMarkerDragEnd(marker.id, toPoint(e.nativeEvent.coordinate)) : undefined}
          />
        ))}
      </MapView>
      <View pointerEvents="none" className="absolute bottom-0 right-0 rounded-tl-sm bg-background/80 px-1">
        <Text className={cn(TEXT.labelSmall, 'text-muted-foreground')}>{OSM_ATTRIBUTION}</Text>
      </View>
    </View>
  );
}
