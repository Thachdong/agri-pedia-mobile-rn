import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';
import { useSession } from '@/features/auth';
import { useUploadMedia } from '@/features/media';
import { pickDocument, pickImage } from '@/shared/lib/device';
import { AppError } from '@/shared/lib/http';
import { toast } from '@/shared/lib/toast';
import { renderWithProviders } from '@/test-utils';
import { updateMe } from '../services/user.service';
import { authenticatedSession } from '../test/user.fixtures';
import { EditProfileSheet, type TEditProfileSheetProps } from './edit-profile-sheet';

jest.mock('../services/user.service');
jest.mock('@/features/auth', () => ({ useSession: jest.fn() }));
jest.mock('@/features/media', () => ({
  ...jest.requireActual('@/features/media/constants/media.constants'),
  ...jest.requireActual('@/features/media/utils/media-type.util'),
  useUploadMedia: jest.fn(),
}));
jest.mock('@/shared/lib/device', () => ({ pickImage: jest.fn(), pickDocument: jest.fn() }));
jest.mock('@/shared/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const onClose = jest.fn();
const upload = jest.fn();
const renderSheet = () =>
  renderWithProviders(<EditProfileSheet sheetRef={createRef() as TEditProfileSheetProps['sheetRef']} onClose={onClose} />);

describe('EditProfileSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue(
      authenticatedSession({ id: 'd1', role: 'DISTRIBUTOR', username: 'Minh Phát', bussinessType: 'SEEDS_SEEDLINGS', bio: 'Cũ' }),
    );
    jest.mocked(useUploadMedia).mockReturnValue({ mutateAsync: upload, isPending: false } as never);
    jest.mocked(updateMe).mockResolvedValue({} as never);
  });

  it('prefilled; text only → no file upload, PATCH text fields', async () => {
    upload.mockResolvedValue([]);
    await renderSheet();
    expect(screen.getByDisplayValue('Minh Phát')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Giới thiệu'), '  Mới  ');
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(upload).toHaveBeenCalledWith([]);
    expect(updateMe).toHaveBeenCalledWith({ username: 'Minh Phát', bio: 'Mới', bussinessType: 'SEEDS_SEEDLINGS' });
    expect(toast.success).toHaveBeenCalledWith('Đã cập nhật hồ sơ');
  });

  it('picked avatar + pdf license → uploaded (IMAGE, FILE) then sent with their keys', async () => {
    jest.mocked(pickImage).mockResolvedValue({ uri: 'file:///a.jpg', name: 'a.jpg', mimeType: 'image/jpeg', size: 10, extension: 'jpg' });
    jest
      .mocked(pickDocument)
      .mockResolvedValue({ uri: 'file:///gp.pdf', name: 'gp.pdf', mimeType: 'application/pdf', size: 10, extension: 'pdf' });
    const avatar = { type: 'IMAGE', key: 'tmp/a', extension: 'jpg', filename: 'a.jpg' };
    const license = { type: 'FILE', key: 'tmp/gp', extension: 'pdf', filename: 'gp.pdf' };
    upload.mockResolvedValue([avatar, license]);
    await renderSheet();

    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Ảnh đại diện' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Giấy phép kinh doanh' }));
    expect(await screen.findByText('gp.pdf')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(updateMe).toHaveBeenCalled());
    expect(upload).toHaveBeenCalledWith([
      expect.objectContaining({ type: 'IMAGE', file: expect.objectContaining({ name: 'a.jpg' }) }),
      expect.objectContaining({ type: 'FILE', file: expect.objectContaining({ name: 'gp.pdf' }) }),
    ]);
    expect(updateMe).toHaveBeenCalledWith(expect.objectContaining({ avatar, bussinessLicense: license }));
  });

  it('server error → message under the form, stays open', async () => {
    upload.mockResolvedValue([]);
    jest.mocked(updateMe).mockRejectedValue(new AppError({ status: 404, code: 'USER_NOT_FOUND', message: 'x' }));
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Không tìm thấy tài khoản.')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('PATCH failed after upload → retry reuses the uploaded file (no second upload)', async () => {
    jest.mocked(pickImage).mockResolvedValue({ uri: 'file:///a.jpg', name: 'a.jpg', mimeType: 'image/jpeg', size: 10, extension: 'jpg' });
    const avatar = { type: 'IMAGE', key: 'tmp/a', extension: 'jpg', filename: 'a.jpg' };
    upload.mockResolvedValueOnce([avatar]).mockResolvedValueOnce([]);
    jest
      .mocked(updateMe)
      .mockRejectedValueOnce(new AppError({ status: 0, code: 'NETWORK_ERROR', message: 'x' }))
      .mockResolvedValueOnce({} as never);
    await renderSheet();
    await fireEvent.press(screen.getByRole('button', { name: 'Chọn Ảnh đại diện' }));
    await screen.findByText('a.jpg');

    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(upload).toHaveBeenNthCalledWith(2, []);
    expect(updateMe).toHaveBeenLastCalledWith(expect.objectContaining({ avatar }));
  });

  it('FARMER → no business type / license fields; PATCH without bussinessType', async () => {
    jest.mocked(useSession).mockReturnValue(authenticatedSession({ id: 'f1', role: 'FARMER', username: 'Bác Ba', bio: null }));
    upload.mockResolvedValue([]);
    await renderSheet();
    expect(screen.queryByText('Lĩnh vực kinh doanh')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Chọn Giấy phép kinh doanh' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Chọn Ảnh đại diện' })).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Giới thiệu'), 'Trồng lúa');
    await fireEvent.press(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(updateMe).toHaveBeenCalledWith({ username: 'Bác Ba', bio: 'Trồng lúa' });
  });
});
