import { fireEvent, render, screen } from '@testing-library/react-native';
import { FilePickerField } from './file-picker-field';

describe('FilePickerField', () => {
  it('nothing picked → current label, "Đổi" opens the picker, no remove', async () => {
    const onPick = jest.fn();
    await render(
      <FilePickerField label="Giấy phép" value={null} currentLabel="Đã có giấy phép" onPick={onPick} onClear={jest.fn()} />,
    );
    expect(screen.getByText('Đã có giấy phép')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Bỏ Giấy phép' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Giấy phép' }));
    expect(onPick).toHaveBeenCalled();
  });

  it('picked → file name + remove; error replaces the hint', async () => {
    const onClear = jest.fn();
    await render(
      <FilePickerField
        label="Giấy phép"
        value={{ uri: 'file:///gp.pdf', name: 'gp.pdf', mimeType: 'application/pdf' }}
        onPick={jest.fn()}
        onClear={onClear}
        hint="Ảnh hoặc PDF"
        error="Tệp tối đa 10 MB"
      />,
    );
    expect(screen.getByText('gp.pdf')).toBeOnTheScreen();
    expect(screen.getByText('Tệp tối đa 10 MB')).toBeOnTheScreen();
    expect(screen.queryByText('Ảnh hoặc PDF')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Bỏ Giấy phép' }));
    expect(onClear).toHaveBeenCalled();
  });
});
