import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { pickDocument, pickImage, pickImages } from './file-picker';

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

describe('pickImages', () => {
  const asset = (name: string) => ({ uri: `file:///cache/${name}.jpg`, fileName: `${name}.jpg`, mimeType: 'image/jpeg', fileSize: 10 });

  it('multi-select up to limit, ordered; caps when the platform returns more', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [asset('a'), asset('b'), asset('c')],
    } as never);
    const files = await pickImages({ limit: 2 });
    expect(files.map((file) => file.name)).toEqual(['a.jpg', 'b.jpg']);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: 2, orderedSelection: true }),
    );
  });

  it('limit < 1 → [] without opening the picker', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockClear();
    await expect(pickImages({ limit: 0 })).resolves.toEqual([]);
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('cancelled or native error → []', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: null } as never);
    await expect(pickImages({ limit: 3 })).resolves.toEqual([]);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockRejectedValueOnce(new Error('native'));
    await expect(pickImages({ limit: 3 })).resolves.toEqual([]);
  });
});
