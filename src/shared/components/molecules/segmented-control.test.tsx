import { fireEvent, render, screen } from '@testing-library/react-native';
import { SegmentedControl } from './segmented-control';

const OPTIONS = [
  { value: 'EMAIL', label: 'EMAIL' },
  { value: 'PHONE', label: 'PHONE' },
] as const;

describe('SegmentedControl', () => {
  it('marks the selected tab and reports the other one', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={OPTIONS} value="EMAIL" onChange={onChange} accessibilityLabel="Đăng ký bằng" />);

    expect(screen.getByRole('tab', { name: 'EMAIL' })).toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'EMAIL' }));
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('tab', { name: 'PHONE' }));
    expect(onChange).toHaveBeenCalledWith('PHONE');
  });
});
