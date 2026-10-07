/** WGS84 coordinate, field names as the API (`address.lat` / `address.long`). Package-neutral: no expo-location / react-native-maps types leak out of shared/lib. */
export type TGeoPoint = {
  lat: number;
  long: number;
};
