import { act, renderHook, waitFor } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { createDiagnosis, getDiagnosisSettings } from '../services/diagnosis.service';
import { getCrops } from '../services/knowledge.service';
import { crop, diagnosisSettings } from '../test/diagnosis.fixtures';
import { useCreateDiagnosis } from './use-create-diagnosis';
import { useCrops } from './use-crops';
import { useDiagnosisSettings } from './use-diagnosis-settings';

jest.mock('../services/diagnosis.service');
jest.mock('../services/knowledge.service');

describe('diagnosis hooks', () => {
  beforeEach(() => jest.resetAllMocks());

  it('useCrops → the crops array', async () => {
    jest.mocked(getCrops).mockResolvedValue({ crops: [crop()] });
    const { result } = await renderHook(() => useCrops(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([crop()]));
  });

  it('useDiagnosisSettings → the settings', async () => {
    jest.mocked(getDiagnosisSettings).mockResolvedValue(diagnosisSettings());
    const { result } = await renderHook(() => useDiagnosisSettings(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data?.remainingToday).toBe(2));
  });

  it('useCreateDiagnosis → settings stale (remainingToday changed)', async () => {
    jest.mocked(createDiagnosis).mockResolvedValue({ id: 'g1', status: 'PROCESSING' });
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.diagnoses.settings(), diagnosisSettings());
    const { result } = await renderHook(() => useCreateDiagnosis(), { wrapper: hookWrapper(client) });
    await act(() => result.current.mutateAsync({ cropType: 'RICE', images: [{ uri: 'file:///a.jpg', plantPart: 'LEAF' }] }));
    expect(client.getQueryState(queryKeys.diagnoses.settings())?.isInvalidated).toBe(true);
  });
});
