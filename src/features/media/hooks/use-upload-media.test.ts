import { presignUrls, putMediaFile } from '../services/media.service';
import { uploadMedia } from './use-upload-media';

jest.mock('../services/media.service');

const picked = (name: string, extension: string) => ({
  uri: `file:///${name}`,
  name,
  mimeType: 'x',
  size: 1,
  extension,
});

describe('uploadMedia', () => {
  beforeEach(() => jest.resetAllMocks());

  it('one presign for all files, PUT each, returns the save DTOs in order', async () => {
    jest.mocked(presignUrls).mockResolvedValue({
      items: [
        { presignUrl: 'u1', key: 'tmp/1', headers: { a: '1' } },
        { presignUrl: 'u2', key: 'tmp/2', headers: { b: '2' } },
      ],
    });
    jest.mocked(putMediaFile).mockResolvedValue(undefined);

    const result = await uploadMedia([
      { file: picked('a.jpg', 'jpg'), type: 'IMAGE' },
      { file: picked('gp.pdf', 'pdf'), type: 'FILE' },
    ]);

    expect(presignUrls).toHaveBeenCalledWith([
      { filename: 'a.jpg', extension: 'jpg', type: 'IMAGE' },
      { filename: 'gp.pdf', extension: 'pdf', type: 'FILE' },
    ]);
    expect(putMediaFile).toHaveBeenCalledWith(expect.objectContaining({ key: 'tmp/2' }), 'file:///gp.pdf');
    expect(result).toEqual([
      { filename: 'a.jpg', extension: 'jpg', type: 'IMAGE', key: 'tmp/1' },
      { filename: 'gp.pdf', extension: 'pdf', type: 'FILE', key: 'tmp/2' },
    ]);
  });

  it('no file → no request', async () => {
    await expect(uploadMedia([])).resolves.toEqual([]);
    expect(presignUrls).not.toHaveBeenCalled();
  });
});
