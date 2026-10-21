// Route tests live here, not next to the route: every file under src/app becomes an Expo Router route.
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import DiagnosisScreen from '@/app/(private)/diagnosis/[id]';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'g1' }) }));
jest.mock('@/shared/components/organisms', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ScreenHeader: ({ title }: { title: string }) => <Text>{title}</Text> };
});
jest.mock('@/features/diagnosis', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    DiagnosisResult: ({ id, actions }: { id: string; actions: ReactNode }) => (
      <>
        <Text>{`result:${id}`}</Text>
        {actions}
      </>
    ),
  };
});
jest.mock('@/features/diagnosis-share', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SendReportButton: ({ diagnosisId }: { diagnosisId: string }) => <Text>{`send:${diagnosisId}`}</Text> };
});

describe('DiagnosisScreen "/diagnosis/[id]"', () => {
  it('title, the result of the id and the send-report action', async () => {
    await render(<DiagnosisScreen />);
    expect(screen.getByText('Kết quả chẩn đoán')).toBeOnTheScreen();
    expect(screen.getByText('result:g1')).toBeOnTheScreen();
    expect(screen.getByText('send:g1')).toBeOnTheScreen();
  });
});
