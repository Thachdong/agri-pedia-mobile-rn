import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@/test-utils';
import { getProductReviews, getReviewSummary } from '../services/review.service';
import { distributorReview } from '../test/review.fixtures';
import { ProductReviewsPanel } from './product-reviews-panel';

jest.mock('../services/review.service');

const summary = {
  avgRating: 4,
  reviewCount: 1,
  oneStarCount: 0,
  twoStarCount: 0,
  threeStarCount: 0,
  fourStarCount: 1,
  fiveStarCount: 0,
};

describe('ProductReviewsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('header + product rating + reviews; own review highlighted', async () => {
    jest.mocked(getReviewSummary).mockResolvedValue(summary);
    jest.mocked(getProductReviews).mockResolvedValue({
      reviews: [{ ...distributorReview({ star: 4, user: { id: 'f1', username: 'Bác Ba', avatar: null } }) }],
      nextCursor: null,
    } as never);
    await renderWithProviders(<ProductReviewsPanel productId="p1" currentUserId="f1" header={<Text>INFO</Text>} />);

    expect(await screen.findByText('Đánh giá của bạn')).toBeOnTheScreen();
    expect(await screen.findByText('Đánh giá: 4,0 / 5')).toBeOnTheScreen();
    expect(screen.getByText('INFO')).toBeOnTheScreen();
    expect(getReviewSummary).toHaveBeenCalledWith({ targetType: 'PRODUCT', targetId: 'p1' }, expect.anything());
  });

  it('no review → empty state under the header', async () => {
    jest.mocked(getReviewSummary).mockResolvedValue({ ...summary, avgRating: 0, reviewCount: 0, fourStarCount: 0 });
    jest.mocked(getProductReviews).mockResolvedValue({ reviews: [], nextCursor: null });
    await renderWithProviders(<ProductReviewsPanel productId="p1" header={<Text>INFO</Text>} />);
    expect(await screen.findByText('Chưa có đánh giá')).toBeOnTheScreen();
    expect(screen.getByText('INFO')).toBeOnTheScreen();
  });
});
