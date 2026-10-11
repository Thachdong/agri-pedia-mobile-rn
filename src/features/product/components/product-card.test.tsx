import { fireEvent, render, screen } from '@testing-library/react-native';
import { distributorProduct } from '../test/product.fixtures';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  it('name, price / unit, quantity; press → id', async () => {
    const onPress = jest.fn();
    await render(<ProductCard product={distributorProduct({ unit: '50kg' })} onPress={onPress} />);
    expect(screen.getByText('Lúa giống OM18')).toBeOnTheScreen();
    expect(screen.getByText(/150\.000\s₫ \/ bao 50kg/)).toBeOnTheScreen();
    expect(screen.getByText('Số lượng: 120')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith('p1');
  });
});
