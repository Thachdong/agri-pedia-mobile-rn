import { fireEvent, render, screen } from '@testing-library/react-native';
import { DistributorProfileTabs } from './distributor-profile-tabs';

describe('DistributorProfileTabs', () => {
  it('defaults to Sản Phẩm', async () => {
    await render(<DistributorProfileTabs />);
    expect(screen.getByRole('tab', { name: 'Sản Phẩm' })).toBeSelected();
    expect(screen.getByText('Chưa có sản phẩm')).toBeOnTheScreen();
  });

  it('switching to Đánh giá shows the reviews panel', async () => {
    await render(<DistributorProfileTabs />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Đánh giá' }));
    expect(screen.getByRole('tab', { name: 'Đánh giá' })).toBeSelected();
    expect(screen.getByText('Chưa có đánh giá')).toBeOnTheScreen();
    expect(screen.queryByText('Chưa có sản phẩm')).toBeNull();
  });
});
