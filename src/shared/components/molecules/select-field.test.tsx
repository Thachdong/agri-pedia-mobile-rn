import { fireEvent, render, screen } from '@testing-library/react-native';
import { SelectField } from './select-field';

// The sheet mock renders its content inline, so options are always on screen.
// > 8 options → search box shown. FlatList renders the first 10 in tests, so the asserted ones come first.
const OPTIONS = [
  { value: 'ha_noi', label: 'Hà Nội' },
  { value: 'da_nang', label: 'Đà Nẵng' },
  ...Array.from({ length: 8 }, (_, i) => ({ value: `p${i}`, label: `Tỉnh ${i}` })),
];

describe('SelectField', () => {
  it('shows the placeholder, then the chosen label', async () => {
    const onChange = jest.fn();
    const { rerender } = await render(
      <SelectField label="Tỉnh/Thành phố" placeholder="Chọn tỉnh" options={OPTIONS} value={null} onChange={onChange} />,
    );
    expect(screen.getByRole('button', { name: 'Tỉnh/Thành phố: Chọn tỉnh' })).toBeTruthy();

    await fireEvent.press(screen.getByText('Hà Nội'));
    expect(onChange).toHaveBeenCalledWith('ha_noi');

    await rerender(<SelectField label="Tỉnh/Thành phố" options={OPTIONS} value="ha_noi" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Tỉnh/Thành phố: Hà Nội' })).toBeTruthy();
  });

  it('search ignores case and Vietnamese diacritics', async () => {
    await render(<SelectField label="Tỉnh/Thành phố" options={OPTIONS} value={null} onChange={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText('Tìm tỉnh/thành phố'), 'DA NANG');
    expect(screen.getByText('Đà Nẵng')).toBeTruthy();
    expect(screen.queryByText('Hà Nội')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Tìm tỉnh/thành phố'), 'xyz');
    expect(screen.getByText('Không tìm thấy kết quả')).toBeTruthy();
  });

  it('loading disables the field; load error offers a retry', async () => {
    const onRetry = jest.fn();
    await render(
      <SelectField label="Phường/Xã" options={[]} value={null} onChange={jest.fn()} loading error="Không tải được" onRetry={onRetry} />,
    );
    const field = screen.getByRole('button', { name: 'Phường/Xã: Chọn' });
    expect(field).toBeDisabled();
    expect(field).toBeBusy();
    await fireEvent.press(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
