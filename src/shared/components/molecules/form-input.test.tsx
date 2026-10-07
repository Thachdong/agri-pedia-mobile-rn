import { fireEvent, render, screen } from '@testing-library/react-native';
import { FormInput } from './form-input';

describe('FormInput', () => {
  it('shows the error instead of the hint', async () => {
    await render(<FormInput label="Mật khẩu" hint="8–128 ký tự" error="Tối thiểu 8 ký tự" />);
    expect(screen.getByText('Tối thiểu 8 ký tự')).toBeTruthy();
    expect(screen.queryByText('8–128 ký tự')).toBeNull();
  });

  it('secureToggle hides the text and reveals it on demand', async () => {
    await render(<FormInput label="Mật khẩu" secureToggle value="12345678" />);
    const input = screen.getByLabelText('Mật khẩu');
    expect(input).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(screen.getByLabelText('Mật khẩu')).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeTruthy();
  });
});
