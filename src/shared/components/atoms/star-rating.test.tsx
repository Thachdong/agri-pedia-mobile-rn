import { fireEvent, render, screen } from '@testing-library/react-native';
import { StarRating } from './star-rating';
import { StarRatingInput } from './star-rating-input';

describe('StarRating', () => {
  it('label rounded to the nearest half star', async () => {
    await render(<StarRating value={4.3} />);
    expect(screen.getByRole('image', { name: '4,5 trên 5 sao' })).toBeOnTheScreen();
  });
});

describe('StarRatingInput', () => {
  it('5 radios, current one checked, press → onChange(star)', async () => {
    const onChange = jest.fn();
    await render(<StarRatingInput value={3} onChange={onChange} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '3 sao' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: '5 sao' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('disabled → no change', async () => {
    const onChange = jest.fn();
    await render(<StarRatingInput value={0} onChange={onChange} disabled />);
    await fireEvent.press(screen.getByRole('radio', { name: '1 sao' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
