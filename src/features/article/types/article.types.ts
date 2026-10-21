import type { TApiSchema } from '@/shared/lib/http';

/** GET /knowledge/articles/top — one group per crop (crop sortOrder), articles in the order admins chose. */
export type TTopArticlesResponse = TApiSchema<'ListTopArticlesResponse'>;
export type TTopArticlesGroup = TApiSchema<'TopArticlesGroupResponse'>;
/** Article summary — `path` is the web path (/benh-cay-trong/<crop>/<slug>), `coverUrl` may be null. */
export type TArticleListItem = TApiSchema<'ArticleListItemResponse'>;
export type TArticleCrop = TApiSchema<'ArticleCropResponse'>;
