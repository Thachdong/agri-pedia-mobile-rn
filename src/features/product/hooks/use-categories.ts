import { useAppQuery } from '@/shared/lib/query';
import { categoriesQuery } from './product.queries';

/** Product categories (ordered by name) — form select + category name on the detail page. */
export const useCategories = () => useAppQuery(categoriesQuery());
