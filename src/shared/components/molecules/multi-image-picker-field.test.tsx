import { fireEvent, render, screen } from '@testing-library/react-native';
import { MultiImagePickerField, type TMultiImagePickerFieldProps } from './multi-image-picker-field';

const props = (overrides: Partial<TMultiImagePickerFieldProps> = {}): TMultiImagePickerFieldProps => ({
  label: 'Ảnh sản phẩm',
  existing: [{ key: 'm1', uri: 'https://x/1.jpg' }],
  picked: [{ key: 'file:///a.jpg', uri: 'file:///a.jpg' }],
  onRemoveExisting: jest.fn(),
  onRemovePicked: jest.fn(),
  onAdd: jest.fn(),
  max: 10,
  ...overrides,
});

describe('MultiImagePickerField', () => {
  it('count, remove each kind, add', async () => {
    const p = props();
    await render(<MultiImagePickerField {...p} />);
    expect(screen.getByText('2 / 10')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá ảnh 1' }));
    expect(p.onRemoveExisting).toHaveBeenCalledWith('m1');
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá ảnh 2' }));
    expect(p.onRemovePicked).toHaveBeenCalledWith('file:///a.jpg');
    await fireEvent.press(screen.getByRole('button', { name: 'Thêm ảnh sản phẩm' }));
    expect(p.onAdd).toHaveBeenCalled();
  });

  it('full → no add tile; error shown', async () => {
    await render(<MultiImagePickerField {...props({ max: 2, error: 'Sản phẩm cần từ 1 đến 10 ảnh' })} />);
    expect(screen.queryByRole('button', { name: 'Thêm ảnh sản phẩm' })).toBeNull();
    expect(screen.getByText('Sản phẩm cần từ 1 đến 10 ảnh')).toBeOnTheScreen();
  });

  it('thumbnail that fails to load (expired URL) → icon, still removable', async () => {
    const p = props();
    await render(<MultiImagePickerField {...p} />);
    await fireEvent(screen.getByLabelText('Ảnh 1'), 'error', { nativeEvent: { error: 'expired' } });
    expect(screen.getByRole('image', { name: 'Ảnh 1' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá ảnh 1' }));
    expect(p.onRemoveExisting).toHaveBeenCalledWith('m1');
  });
});

