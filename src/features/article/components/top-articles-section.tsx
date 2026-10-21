import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { useTopArticles } from '../hooks/use-top-articles';
import type { TArticleListItem, TTopArticlesGroup } from '../types/article.types';
import { ArticleCard } from './article-card';

export type TTopArticlesSectionProps = { className?: string };

const articleKey = (article: TArticleListItem) => article.slug;

/**
 * "Bài viết nổi bật" of home "/" (Specs/19102026, chosen by admins): one block per crop — name + "Xem thêm" (articles
 * of the crop) + a horizontal row of cards. Loading / failed / nothing chosen → the whole section is hidden.
 */
export function TopArticlesSection({ className }: TTopArticlesSectionProps) {
  const { data: groups } = useTopArticles();
  if (!groups || groups.length === 0) return null;

  return (
    <View className={cn('gap-4', className)}>
      <Text accessibilityRole="header" className={cn(TEXT.titleMedium, 'text-foreground')}>
        Bài viết nổi bật
      </Text>
      {groups.map((group) => (
        <TopArticlesGroup key={group.crop.slug} group={group} />
      ))}
    </View>
  );
}

function TopArticlesGroup({ group }: { group: TTopArticlesGroup }) {
  const router = useRouter();
  const { crop, articles } = group;

  const openArticle = useCallback(
    (article: TArticleListItem) => router.push(ROUTES.articles.detail(crop.slug, article.slug)),
    [router, crop.slug],
  );

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className={cn(TEXT.titleSmall, 'text-foreground')}>{crop.nameVi}</Text>
        <Button
          label="Xem thêm"
          variant="link"
          size="sm"
          accessibilityLabel={`Xem thêm bài viết về ${crop.nameVi}`}
          onPress={() => router.push(ROUTES.articles.crop(crop.slug))}
        />
      </View>
      <FlatList
        horizontal
        data={articles}
        keyExtractor={articleKey}
        renderItem={({ item }) => <ArticleCard article={item} onPress={openArticle} className="w-64" />}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
      />
    </View>
  );
}
