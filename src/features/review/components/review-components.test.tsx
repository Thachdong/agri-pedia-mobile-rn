import { render, screen } from '@testing-library/react-native';
import { distributorReview } from '../test/review.fixtures';
import { RatingSummary } from './rating-summary';
import { ReviewItem } from './review-item';

const NOW = Date.parse('2026-10-08T12:00:00.000Z');

describe('ReviewItem', () => {
  it('username, stars, content, relative time; product tag for a product review', async () => {
    await render(
      <ReviewItem review={distributorReview({ targetType: 'PRODUCT', productName: 'Lúa ST25', star: 4 })} now={NOW} />,
    );
    expect(screen.getByText('Bác Ba')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: '4 trên 5 sao' })).toBeOnTheScreen();
    expect(screen.getByText('Sản phẩm: Lúa ST25')).toBeOnTheScreen();
    expect(screen.getByText('Hàng tốt')).toBeOnTheScreen();
    expect(screen.getByText('2 giờ trước')).toBeOnTheScreen();
  });

  it('own review → "Đánh giá của bạn"; reviewer gone → "Người dùng"', async () => {
    await render(<ReviewItem review={distributorReview({ user: { id: 'f1', username: null, avatar: null } })} isMine now={NOW} />);
    expect(screen.getByText('Đánh giá của bạn')).toBeOnTheScreen();
    expect(screen.getByText('Người dùng')).toBeOnTheScreen();
  });
});

describe('RatingSummary', () => {
  it('average / 5, total and one row per level', async () => {
    await render(
      <RatingSummary summary={{ avgRating: 4.5, reviewCount: 4, starCounts: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 2 } }} />,
    );
    expect(screen.getByText('Đánh giá: 4,5 / 5')).toBeOnTheScreen();
    expect(screen.getByText('4 đánh giá')).toBeOnTheScreen();
    expect(screen.getByLabelText('5 sao: 2 đánh giá')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 sao: 0 đánh giá')).toBeOnTheScreen();
  });
});
