import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { pickDocument, pickImage } from './file-picker';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));

describe('pickImage', () => {
  it('extension and name from the re-encoded file (HEIC original → jpg)', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/abc.jpg', fileName: 'IMG_1.HEIC', mimeType: 'image/jpeg', fileSize: 1000 }],
    } as never);
    await expect(pickImage()).resolves.toEqual({
      uri: 'file:///cache/abc.jpg',
      name: 'IMG_1.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      extension: 'jpg',
    });
  });

  it('cancelled or native error → null', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: null } as never);
    await expect(pickImage()).resolves.toBeNull();
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockRejectedValueOnce(new Error('native'));
    await expect(pickImage()).resolves.toBeNull();
  });
});

describe('pickDocument', () => {
  it('passes the MIME types, copies to cache, lower-case extension', async () => {
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/gp.PDF', name: 'Giay phep.PDF', mimeType: 'application/pdf', size: 2048 }],
    } as never);
    await expect(pickDocument({ types: ['application/pdf'] })).resolves.toMatchObject({
      name: 'Giay phep.PDF',
      extension: 'pdf',
      size: 2048,
    });
    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({ type: ['application/pdf'], copyToCacheDirectory: true });
  });

  it('cancelled → null', async () => {
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({ canceled: true, assets: null } as never);
    await expect(pickDocument({ types: ['*/*'] })).resolves.toBeNull();
  });
});
