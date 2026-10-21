import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

/** A local file the user picked — `uri` is readable by fetch (upload), `extension` lower case without the dot. */
export type TPickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  /** Bytes; null when the platform doesn't tell. */
  size: number | null;
  extension: string;
};

const IMAGE_QUALITY = 0.8;

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
};
const nameFromUri = (uri: string) => decodeURIComponent(uri.split('/').pop() ?? 'file');

/** Picked image → TPickedFile. Extension of the real file: iOS re-encodes (HEIC → JPEG) while `fileName` keeps the original name. */
const toPickedImage = (asset: ImagePicker.ImagePickerAsset): TPickedFile => {
  const extension = extensionOf(asset.uri);
  const original = asset.fileName ?? nameFromUri(asset.uri);
  const base = original.includes('.') ? original.slice(0, original.lastIndexOf('.')) : original;
  return {
    uri: asset.uri,
    name: extension ? `${base}.${extension}` : original,
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize ?? null,
    extension,
  };
};

/**
 * One image from the photo library (system picker — no permission prompt on iOS 14+ / Android 13+).
 * Cancelled or any native error → null; never throws to the UI.
 */
export async function pickImage(): Promise<TPickedFile | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: IMAGE_QUALITY });
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? toPickedImage(asset) : null;
  } catch {
    return null;
  }
}

/**
 * Up to `limit` images from the photo library in one pick (multi-select), in the order chosen.
 * `limit` < 1 → nothing to pick. Cancelled or any native error → []; never throws to the UI.
 */
export async function pickImages({ limit }: { limit: number }): Promise<TPickedFile[]> {
  if (limit < 1) return [];
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: IMAGE_QUALITY,
      allowsMultipleSelection: true,
      selectionLimit: limit,
      orderedSelection: true,
    });
    // Android ignores `selectionLimit` on some versions — cap here too.
    return result.canceled ? [] : result.assets.slice(0, limit).map(toPickedImage);
  } catch {
    return [];
  }
}

/**
 * One photo from the camera (asks the camera permission first). Denied, cancelled or any native error → null.
 */
export async function takePhoto(): Promise<TPickedFile | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: IMAGE_QUALITY });
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? toPickedImage(asset) : null;
  } catch {
    return null;
  }
}

/**
 * One file from the documents picker, limited to `types` (MIME, e.g. `['image/*', 'application/pdf']`).
 * Copied to the app cache so the uri stays readable. Cancelled or any native error → null.
 */
export async function pickDocument({ types }: { types: string[] }): Promise<TPickedFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;
    return {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
      size: asset.size ?? null,
      extension: extensionOf(asset.name),
    };
  } catch {
    return null;
  }
}
