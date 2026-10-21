import { appQueryOptions, queryKeys } from '@/shared/lib/query';
import { getTopArticles } from '../services/article.service';

/** Server caches 60s. `silent`: a failing block is hidden, never toasted. */
const TOP_ARTICLES_STALE_MS = 60_000;

export const topArticlesQuery = () =>
  appQueryOptions({
    queryKey: queryKeys.articles.top(),
    queryFn: ({ signal }) => getTopArticles(signal),
    select: (data) => data.crops,
    staleTime: TOP_ARTICLES_STALE_MS,
    meta: { silent: true },
  });
