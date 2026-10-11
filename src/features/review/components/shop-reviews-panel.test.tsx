import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@/test-utils';
import { getDistributorReviews } from '../services/review.service';
import { distributorReview, distributorReviewsPage } from '../test/review.fixtures';
import { ShopReviewsPanel } from './shop-reviews-panel';

jest.mock('../services/review.service');

describe('ShopReviewsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('header kept while loading, then rating + reviews; own review highlighted', async () => {
    let resolve: (page: ReturnType<typeof distributorReviewsPage>) => void = () => {};
    jest.mocked(getDistributorReviews).mockReturnValue(new Promise((r) => (resolve = r)));
    await renderWithProviders(<ShopReviewsPanel distributorId="d1" currentUserId="f1" header={<Text>INFO</Text>} />);
    expect(screen.getByText('INFO')).toBeOnTheScreen();
    expect(screen.getByLabelText('Đang tải')).toBeOnTheScreen();

    resolve(distributorReviewsPage({ reviews: [distributorReview({ user: { id: 'f1', username: 'Bác Ba', avatar: null } })] }));

    expect(await screen.findByText('Đánh giá của bạn')).toBeOnTheScreen();
    expect(screen.getByText('Đánh giá: 5,0 / 5')).toBeOnTheScreen();
    expect(screen.getByText('INFO')).toBeOnTheScreen();
  });

  it('error → header kept + retry', async () => {
    jest.mocked(getDistributorReviews).mockRejectedValue(new Error('boom'));
    await renderWithProviders(<ShopReviewsPanel distributorId="d1" header={<Text>INFO</Text>} />);
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeOnTheScreen();
    expect(screen.getByText('INFO')).toBeOnTheScreen();
  });

  it('no review → empty state', async () => {
    jest.mocked(getDistributorReviews).mockResolvedValue(distributorReviewsPage({ reviews: [] }));
    await renderWithProviders(<ShopReviewsPanel distributorId="d1" />);
    expect(await screen.findByText('Chưa có đánh giá')).toBeOnTheScreen();
  });
});
