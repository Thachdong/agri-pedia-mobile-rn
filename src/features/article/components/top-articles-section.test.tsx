import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { renderWithProviders } from '@/test-utils';
import { getTopArticles } from '../services/article.service';
import { articleItem, topGroup } from '../test/article.fixtures';
import { TopArticlesSection } from './top-articles-section';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('../services/article.service');

describe('TopArticlesSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('one block per crop; card → article, "Xem thêm" → articles of the crop', async () => {
    jest.mocked(getTopArticles).mockResolvedValue({
      crops: [
        topGroup(),
        topGroup({
          crop: { code: 'DURIAN', slug: 'sau-rieng', nameVi: 'Sầu riêng', diagnosisEnabled: true },
          articles: [articleItem({ slug: 'thoi-trai', title: 'Thối trái sầu riêng', disease: null })],
        }),
      ],
    });
    await renderWithProviders(<TopArticlesSection />);
    expect(await screen.findByRole('header', { name: 'Bài viết nổi bật' })).toBeOnTheScreen();
    expect(screen.getByText('Đạo ôn')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Thối trái sầu riêng' }));
    expect(mockPush).toHaveBeenCalledWith('/articles/sau-rieng/thoi-trai');
    await fireEvent.press(screen.getByRole('button', { name: 'Xem thêm bài viết về Lúa' }));
    expect(mockPush).toHaveBeenCalledWith('/articles/lua');
  });

  it.each([
    ['nothing chosen', () => jest.mocked(getTopArticles).mockResolvedValue({ crops: [] })],
    ['failing', () => jest.mocked(getTopArticles).mockRejectedValue(new Error('down'))],
  ])('%s → hidden', async (_, arrange) => {
    arrange();
    const { client } = await renderWithProviders(<TopArticlesSection />);
    await waitFor(() => expect(client.getQueryState(queryKeys.articles.top())?.status).not.toBe('pending'));
    expect(screen.queryByText('Bài viết nổi bật')).toBeNull();
  });
});
