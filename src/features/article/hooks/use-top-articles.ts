import { useAppQuery } from '@/shared/lib/query';
import { topArticlesQuery } from './article.queries';

export const useTopArticles = () => useAppQuery(topArticlesQuery());
