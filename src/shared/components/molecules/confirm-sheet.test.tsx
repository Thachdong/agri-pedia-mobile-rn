import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { ConfirmSheet, type TConfirmSheetProps } from './confirm-sheet';

const props = (overrides: Partial<TConfirmSheetProps> = {}): TConfirmSheetProps => ({
  sheetRef: createRef() as TConfirmSheetProps['sheetRef'],
  onClose: jest.fn(),
  title: 'Xoá sản phẩm?',
  description: 'Không thể hoàn tác.',
  confirmLabel: 'Xoá',
  onConfirm: jest.fn(),
  ...overrides,
});

describe('ConfirmSheet', () => {
  it('Huỷ closes, Xoá confirms', async () => {
    const p = props();
    await render(<ConfirmSheet {...p} />);
    expect(screen.getByRole('header', { name: 'Xoá sản phẩm?' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Huỷ' }));
    expect(p.onClose).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá' }));
    expect(p.onConfirm).toHaveBeenCalled();
  });

  it('loading → both disabled; error shown', async () => {
    await render(<ConfirmSheet {...props({ loading: true, error: 'Sản phẩm không còn tồn tại.' })} />);
    expect(screen.getByRole('button', { name: 'Huỷ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
    expect(screen.getByText('Sản phẩm không còn tồn tại.')).toBeOnTheScreen();
  });
});
