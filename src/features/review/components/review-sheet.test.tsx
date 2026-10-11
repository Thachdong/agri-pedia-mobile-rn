import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { createReview } from '../services/review.service';
import { ReviewSheet, type TReviewSheetProps } from './review-sheet';

jest.mock('../services/review.service');
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const onClose = jest.fn();
const renderSheet = () =>
  renderWithProviders(
    <ReviewSheet
      sheetRef={createRef() as TReviewSheetProps['sheetRef']}
      onClose={onClose}
      targetType="USER"
      targetId="d1"
      targetName="Đại lý Minh Phát"
    />,
  );

const fillAndSubmit = async () => {
  await fireEvent.press(screen.getByRole('radio', { name: '4 sao' }));
  await fireEvent.changeText(screen.getByLabelText('Nội dung'), '  Giao nhanh  ');
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi đánh giá' }));
};

describe('ReviewSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('no star → schema message, nothing sent', async () => {
    await renderSheet();
    await fireEvent.changeText(screen.getByLabelText('Nội dung'), 'ok');
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi đánh giá' }));
    expect(await screen.findByText('Vui lòng chọn số sao')).toBeOnTheScreen();
    expect(createReview).not.toHaveBeenCalled();
  });

  it('valid → POST USER review (trimmed), toast, close', async () => {
    jest.mocked(createReview).mockResolvedValue({ reviewId: 'rv1' });
    await renderSheet();
    await fillAndSubmit();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createReview).toHaveBeenCalledWith({ targetType: 'USER', targetId: 'd1', star: 4, content: 'Giao nhanh' });
    expect(toast.success).toHaveBeenCalledWith('Đã gửi đánh giá');
  });

  it('409 already reviewed → message under the form, stays open', async () => {
    jest
      .mocked(createReview)
      .mockRejectedValue(new AppError({ status: 409, code: 'REVIEW_ALREADY_EXISTS', message: 'Conflict' }));
    await renderSheet();
    await fillAndSubmit();
    expect(await screen.findByText('Bạn đã đánh giá rồi.')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();
  });
});
