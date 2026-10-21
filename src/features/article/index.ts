// Public API of the `article` feature. Other features and src/app import only this file.
export { topArticlesQuery } from './hooks/article.queries';
export { useTopArticles } from './hooks/use-top-articles';
export type { TArticleListItem, TTopArticlesGroup } from './types/article.types';
