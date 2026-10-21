import type { TArticleListItem, TTopArticlesGroup } from '../types/article.types';

export const articleItem = (overrides: Partial<TArticleListItem> = {}): TArticleListItem => ({
  path: '/benh-cay-trong/lua/dao-on',
  slug: 'dao-on',
  title: 'Bệnh đạo ôn trên lúa',
  summary: 'Nhận biết và phòng trừ bệnh đạo ôn.',
  coverUrl: null,
  status: 'REVIEWED',
  origin: 'ADMIN',
  updatedAt: '2026-10-19T00:00:00.000Z',
  disease: { code: 'RICE_BLAST', nameVi: 'Đạo ôn', scientificName: null, category: 'DISEASE' },
  variant: null,
  ...overrides,
});

export const topGroup = (overrides: Partial<TTopArticlesGroup> = {}): TTopArticlesGroup => ({
  crop: { code: 'RICE', slug: 'lua', nameVi: 'Lúa', diagnosisEnabled: true },
  articles: [articleItem()],
  ...overrides,
});
