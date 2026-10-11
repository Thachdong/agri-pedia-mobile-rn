import { fireEvent, screen } from '@testing-library/react-native';
import { useSession, type TCurrentUser, type TSession } from '@/features/auth';
import { useDistributorReviews } from '@/features/review';
import { renderWithProviders } from '@/test-utils';
import { getDistributorProfile } from '../services/distributor-profile.service';
import { distributorProfile } from '../test/distributor.fixtures';
import { DistributorProfileActions } from './distributor-profile-actions';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }), usePathname: () => '/profile/d1' }));
jest.mock('../services/distributor-profile.service');
jest.mock('@/features/auth', () => ({ useSession: jest.fn(), LoginRequiredSheet: () => null }));
jest.mock('@/features/review', () => ({ useDistributorReviews: jest.fn(), ReviewShopSheet: () => null }));
jest.mock('@/features/user', () => ({ EditProfileSheet: () => null }));

/** No argument → guest; `{}` → FARMER u1. */
const session = (user?: Partial<TCurrentUser>): TSession =>
  user
    ? { status: 'authenticated', user: { id: 'u1', role: 'FARMER', ...user } as TCurrentUser, isLoggedIn: true }
    : { status: 'guest', user: undefined, isLoggedIn: false };
const reviewsBy = (userId?: string) =>
  ({
    data: userId ? { reviews: [{ targetType: 'USER', user: { id: userId } }] } : { reviews: [] },
  }) as unknown as ReturnType<typeof useDistributorReviews>;

describe('DistributorProfileActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getDistributorProfile).mockResolvedValue(distributorProfile());
    jest.mocked(useDistributorReviews).mockReturnValue(reviewsBy());
  });

  it('owner → only "Chỉnh sửa"', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd1', role: 'DISTRIBUTOR' }));
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull();
  });

  it('FARMER → Chat opens the chat screen, Đánh giá enabled', async () => {
    jest.mocked(useSession).mockReturnValue(session({}));
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Chat' }));
    expect(mockPush).toHaveBeenCalledWith('/chat/user/d1');
    expect(screen.getByRole('button', { name: 'Đánh giá' })).toBeEnabled();
  });

  it('FARMER who already reviewed the shop → "Đã đánh giá" disabled', async () => {
    jest.mocked(useSession).mockReturnValue(session({}));
    jest.mocked(useDistributorReviews).mockReturnValue(reviewsBy('u1'));
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    expect(screen.getByRole('button', { name: 'Đã đánh giá' })).toBeDisabled();
  });

  it('guest → Chat + Đánh giá shown, Chat does not navigate (login sheet)', async () => {
    jest.mocked(useSession).mockReturnValue(session());
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Chat' }));
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Đánh giá' })).toBeOnTheScreen();
  });

  it('another DISTRIBUTOR or session loading → no buttons', async () => {
    jest.mocked(useSession).mockReturnValue(session({ id: 'd2', role: 'DISTRIBUTOR' }));
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    expect(screen.queryByRole('button')).toBeNull();

    jest.mocked(useSession).mockReturnValue({ status: 'loading', user: undefined, isLoggedIn: false });
    await renderWithProviders(<DistributorProfileActions distributorId="d1" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
