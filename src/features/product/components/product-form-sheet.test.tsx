import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';
import { useUploadMedia } from '@/features/media';
import { pickImages } from '@/shared/lib/device';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { createProduct, getCategories, updateProduct } from '../services/product.service';
import { pickedImage, productDetail } from '../test/product.fixtures';
import { ProductFormSheet, type TProductFormSheetProps } from './product-form-sheet';

jest.mock('../services/product.service');
jest.mock('@/features/media', () => ({
  ...jest.requireActual('@/features/media/constants/media.constants'),
  ...jest.requireActual('@/features/media/utils/media-type.util'),
  useUploadMedia: jest.fn(),
}));
jest.mock('@/shared/lib/device', () => ({ pickImages: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const onClose = jest.fn();
const upload = jest.fn();
const uploaded = (key: string) => ({ type: 'IMAGE', key, extension: 'jpg', filename: `${key}.jpg` });
const renderSheet = (product?: TProductFormSheetProps['product']) =>
  renderWithProviders(
    <ProductFormSheet
      sheetRef={createRef() as TProductFormSheetProps['sheetRef']}
      onClose={onClose}
      distributorId="d1"
      product={product}
    />,
  );
const choose = async (field: string, option: string) => {
  await fireEvent.press(screen.getByRole('button', { name: new RegExp(`^${field}:`) }));
  await fireEvent.press(await screen.findByRole('radio', { name: option }));
};

describe('ProductFormSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUploadMedia).mockReturnValue({ mutateAsync: upload, isPending: false } as never);
    jest.mocked(getCategories).mockResolvedValue({ items: [{ id: 'c1', name: 'Hạt giống' }] });
    jest.mocked(createProduct).mockResolvedValue({ productId: 'p9' });
    jest.mocked(updateProduct).mockResolvedValue(undefined);
  });

  it('create: empty submit → field errors, nothing sent', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Thêm sản phẩm' }));
    expect(await screen.findByText('Vui lòng nhập tên sản phẩm')).toBeOnTheScreen();
    expect(screen.getByText('Sản phẩm cần từ 1 đến 10 ảnh')).toBeOnTheScreen();
    expect(upload).not.toHaveBeenCalled();
  });

  it('create: picked images uploaded then POST with keys, toast, close', async () => {
    jest.mocked(pickImages).mockResolvedValue([pickedImage('a'), pickedImage('b')]);
    upload.mockResolvedValue([uploaded('k1'), uploaded('k2')]);
    await renderSheet();
    await fireEvent.changeText(screen.getByLabelText('Tên sản phẩm'), 'Lúa');
    await fireEvent.changeText(screen.getByLabelText('Mô tả'), 'Ngon');
    await fireEvent.changeText(screen.getByLabelText('Giá (VND)'), '12,5');
    await fireEvent.changeText(screen.getByLabelText('Số lượng'), '3');
    await choose('Đơn vị', 'kg');
    await waitFor(() => expect(getCategories).toHaveBeenCalled());
    await choose('Danh mục', 'Hạt giống');
    await fireEvent.press(screen.getByRole('button', { name: 'Thêm ảnh sản phẩm' }));
    expect(pickImages).toHaveBeenCalledWith({ limit: 10 });
    expect(await screen.findByText('2 / 10')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Thêm sản phẩm' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(upload).toHaveBeenCalledWith([
      { type: 'IMAGE', file: expect.objectContaining({ name: 'a.jpg' }) },
      { type: 'IMAGE', file: expect.objectContaining({ name: 'b.jpg' }) },
    ]);
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Lúa', price: 12.5, quantity: 3, unit: 'kg', categoryId: 'c1' }),
    );
    expect(jest.mocked(createProduct).mock.calls[0]?.[0].media.map((m) => m.key)).toEqual(['k1', 'k2']);
    expect(toast.success).toHaveBeenCalledWith('Đã thêm sản phẩm');
  });

  it('edit: prefilled, remove a current image + change status → PATCH removeMediaIds / status', async () => {
    upload.mockResolvedValue([]);
    await renderSheet(productDetail());
    expect(screen.getByDisplayValue('Lúa giống OM18')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Xoá ảnh 1' }));
    await choose('Trạng thái', 'Hết hàng');
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(updateProduct).toHaveBeenCalled());
    expect(updateProduct).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ status: 'OUT_OF_STOCK', removeMediaIds: ['m1'] }),
    );
    expect(toast.success).toHaveBeenCalledWith('Đã cập nhật sản phẩm');
  });

  it('save fails after upload → error under its field; retry reuses the upload', async () => {
    jest.mocked(pickImages).mockResolvedValue([pickedImage('a')]);
    upload.mockResolvedValueOnce([uploaded('k1')]).mockResolvedValue([]);
    jest
      .mocked(updateProduct)
      .mockRejectedValueOnce(new AppError({ status: 400, code: 'PRODUCT_INVALID_PRICE', message: 'x' }))
      .mockResolvedValue(undefined);
    await renderSheet(productDetail());
    await fireEvent.press(screen.getByRole('button', { name: 'Thêm ảnh sản phẩm' }));
    await screen.findByText('3 / 10');
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Giá không hợp lệ.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(upload).toHaveBeenLastCalledWith([]);
    expect(jest.mocked(updateProduct).mock.calls[1]?.[1].addMedia).toEqual([{ ...uploaded('k1'), sortOrder: 2 }]);
  });
});
