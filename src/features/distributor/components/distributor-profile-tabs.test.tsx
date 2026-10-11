import { fireEvent, screen } from '@testing-library/react-native';
import { useSession } from '@/features/auth';
import { renderWithProviders } from '@/test-utils';
import { getDistributorProfile } from '../services/distributor-profile.service';
import { distributorProfile } from '../test/distributor.fixtures';
import { DistributorProfileTabs } from './distributor-profile-tabs';

jest.mock('../services/distributor-profile.service');
jest.mock('./distributor-profile-actions', () => ({ DistributorProfileActions: () => null }));
jest.mock('@/features/location', () => ({ useAddressLabel: () => null }));
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/review', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ShopReviewsPanel: ({ header }: { header: React.ReactNode }) => (
      <>
        {header}
        <MockText>REVIEWS_PANEL</MockText>
      </>
    ),
  };
});

describe('DistributorProfileTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({ status: 'guest', user: undefined, isLoggedIn: false });
  });

  it('defaults to Sản Phẩm under the info', async () => {
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileTabs distributorId="d1" />);
    expect(await screen.findByRole('tab', { name: 'Sản Phẩm' })).toBeSelected();
    expect(screen.getByText('Chưa có sản phẩm')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Đại lý Minh Phát' })).toBeOnTheScreen();
  });

  it('Đánh giá → reviews panel, info kept as its header', async () => {
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    await renderWithProviders(<DistributorProfileTabs distributorId="d1" />);
    await fireEvent.press(await screen.findByRole('tab', { name: 'Đánh giá' }));
    expect(screen.getByText('REVIEWS_PANEL')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Đại lý Minh Phát' })).toBeOnTheScreen();
    expect(screen.queryByText('Chưa có sản phẩm')).toBeNull();
  });

  it('profile failed → no tabs', async () => {
    jest.mocked(getDistributorProfile).mockRejectedValue(new Error('boom'));
    await renderWithProviders(<DistributorProfileTabs distributorId="d1" />);
    expect(await screen.findByText('Không tải được thông tin')).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: 'Sản Phẩm' })).toBeNull();
  });
});
