import { http } from '@/shared/lib/http';
import { createDiagnosis, getDiagnosis, getDiagnosisSettings } from './diagnosis.service';
import { getCrops, getDisease } from './knowledge.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn(), post: jest.fn() } }));


describe('diagnosis / knowledge services', () => {
  beforeEach(() => {
    jest.mocked(http.get).mockReset().mockResolvedValue({});
    jest.mocked(http.post).mockReset().mockResolvedValue({ id: 'g1', status: 'PROCESSING' });
  });

  it('GET /diagnoses/settings and GET /knowledge/crops with the abort signal', async () => {
    const { signal } = new AbortController();
    await getDiagnosisSettings(signal);
    expect(http.get).toHaveBeenCalledWith('/diagnoses/settings', { signal });
    await getCrops(signal);
    expect(http.get).toHaveBeenCalledWith('/knowledge/crops', { signal });
  });

  it('GET /diagnoses/{id} and GET /knowledge/diseases/{code}, ids encoded', async () => {
    await getDiagnosis('a/b');
    expect(http.get).toHaveBeenCalledWith('/diagnoses/a%2Fb', { signal: undefined });
    await getDisease('RICE_BLAST');
    expect(http.get).toHaveBeenCalledWith('/knowledge/diseases/RICE_BLAST', { signal: undefined });
  });

  it('POST /diagnoses multipart: one `images` file per photo in order + `meta` JSON', async () => {
    // Jest runs Node's FormData (no RN file parts) → record what is appended.
    const append = jest.spyOn(FormData.prototype, 'append');
    await createDiagnosis({
      cropType: 'RICE',
      images: [
        { uri: 'file:///a.jpg', plantPart: 'LEAF' },
        { uri: 'file:///b.jpg', plantPart: 'WHOLE_PLANT' },
      ],
      note: 'Lá vàng',
    });
    expect(http.post).toHaveBeenCalledWith('/diagnoses', expect.any(FormData));
    const parts = append.mock.calls as unknown as [string, unknown][];
    expect(parts.filter(([name]) => name === 'images').map(([, file]) => file)).toEqual([
      { uri: 'file:///a.jpg', name: 'image-0.jpg', type: 'image/jpeg' },
      { uri: 'file:///b.jpg', name: 'image-1.jpg', type: 'image/jpeg' },
    ]);
    const meta = parts.find(([name]) => name === 'meta')?.[1];
    expect(JSON.parse(meta as string)).toEqual({
      cropType: 'RICE',
      images: [{ plantPart: 'LEAF' }, { plantPart: 'WHOLE_PLANT' }],
      note: 'Lá vàng',
    });
    append.mockRestore();
  });
});
