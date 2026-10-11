import { fetchCall, mockFetch } from '@/test-utils';
import { APP_ERROR_CODE } from './app-error';
import { uploadToSignedUrl } from './upload';

const blob = { size: 3 } as unknown as Blob;
const fileResponse = { blob: async () => blob } as unknown as Response;
const putResponse = (status: number) => ({ ok: status >= 200 && status < 300, status }) as unknown as Response;

describe('uploadToSignedUrl', () => {
  it('reads the local file and PUTs it with exactly the given headers', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(fileResponse).mockResolvedValueOnce(putResponse(200));

    await uploadToSignedUrl('https://storage/x?sig', 'file:///a.jpg', { headers: { 'Content-Type': 'image/jpeg' } });

    expect(fetchCall(fetchMock, 0).url).toBe('file:///a.jpg');
    const put = fetchCall(fetchMock, 1);
    expect(put.url).toBe('https://storage/x?sig');
    expect(put.init).toMatchObject({ method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } });
  });

  it('storage refuses → UPLOAD_FAILED with its status', async () => {
    mockFetch().mockResolvedValueOnce(fileResponse).mockResolvedValueOnce(putResponse(403));
    await expect(uploadToSignedUrl('https://storage/x', 'file:///a.jpg')).rejects.toMatchObject({
      status: 403,
      code: APP_ERROR_CODE.UPLOAD_FAILED,
    });
  });

  it('no response → NETWORK_ERROR', async () => {
    mockFetch().mockRejectedValue(new TypeError('Network request failed'));
    await expect(uploadToSignedUrl('https://storage/x', 'file:///a.jpg')).rejects.toMatchObject({
      status: 0,
      code: APP_ERROR_CODE.NETWORK_ERROR,
    });
  });
});
