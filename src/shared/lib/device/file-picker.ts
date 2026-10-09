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

/**
 * One image from the photo library (system picker — no permission prompt on iOS 14+ / Android 13+).
 * Cancelled or any native error → null; never throws to the UI.
 */
export async function pickImage(): Promise<TPickedFile | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: IMAGE_QUALITY });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;
    const name = asset.fileName ?? nameFromUri(asset.uri);
    return {
      uri: asset.uri,
      name,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? null,
      extension: extensionOf(name),
    };
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
