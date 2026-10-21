import { render } from '@testing-library/react-native';
import { createRef } from 'react';
import { Text } from 'react-native';
import { AppSheet, type TAppSheetProps } from './app-sheet';

const mockModalProps = jest.fn();
jest.mock('@gorhom/bottom-sheet', () => {
  const actual = jest.requireActual('@gorhom/bottom-sheet/mock');
  return {
    ...actual,
    BottomSheetModal: (props: { children: React.ReactNode }) => {
      mockModalProps(props);
      return props.children;
    },
  };
});

describe('AppSheet', () => {
  it('stacks on top of an open sheet (push), so a select inside a form sheet keeps both open', async () => {
    await render(
      <AppSheet sheetRef={createRef() as TAppSheetProps['sheetRef']}>
        <Text>content</Text>
      </AppSheet>,
    );
    expect(mockModalProps).toHaveBeenCalledWith(expect.objectContaining({ stackBehavior: 'push' }));
  });
});
