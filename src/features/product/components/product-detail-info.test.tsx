import { screen } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { renderWithProviders } from '@/test-utils';
import { getCategories, getProductDetail } from '../services/product.service';
import { productDetail } from '../test/product.fixtures';
import { ProductDetailInfo } from './product-detail-info';

jest.mock('../services/product.service');
jest.mock('expo-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => children }));

describe('ProductDetailInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCategories).mockResolvedValue({ items: [{ id: 'c1', name: 'Hạt giống' }] });
  });

  it('info: name, price / unit, quantity, category, description', async () => {
    jest.mocked(getProductDetail).mockResolvedValue(productDetail());
    await renderWithProviders(<ProductDetailInfo productId="p1" />);
    expect(await screen.findByRole('header', { name: 'Lúa giống OM18' })).toBeOnTheScreen();
    expect(screen.getByText(/150\.000\s₫ \/ kg/)).toBeOnTheScreen();
    expect(screen.getByText('120 kg')).toBeOnTheScreen();
    expect(await screen.findByText('Hạt giống')).toBeOnTheScreen();
    expect(screen.getByText('Giống lúa ngắn ngày')).toBeOnTheScreen();
    expect(screen.queryByText('Trạng thái')).toBeNull();
  });

  it('owner sees the status when not on sale', async () => {
    jest.mocked(getProductDetail).mockResolvedValue(productDetail({ status: 'INACTIVE' }));
    await renderWithProviders(<ProductDetailInfo productId="p1" isOwner />);
    expect(await screen.findByText('Ngừng bán')).toBeOnTheScreen();
  });

  it('visitor never sees the status', async () => {
    jest.mocked(getProductDetail).mockResolvedValue(productDetail({ status: 'INACTIVE' }));
    await renderWithProviders(<ProductDetailInfo productId="p1" />);
    expect(await screen.findByRole('header', { name: 'Lúa giống OM18' })).toBeOnTheScreen();
    expect(screen.queryByText('Ngừng bán')).toBeNull();
  });

  it('404 → not found, no retry', async () => {
    jest
      .mocked(getProductDetail)
      .mockRejectedValue(new AppError({ status: 404, code: 'PRODUCT_NOT_FOUND', message: 'x' }));
    await renderWithProviders(<ProductDetailInfo productId="p1" />);
    expect(await screen.findByText('Sản phẩm không tồn tại')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Thử lại' })).toBeNull();
  });
});
