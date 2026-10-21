import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TArticleListItem } from '../types/article.types';

export type TArticleCardProps = {
  article: TArticleListItem;
  onPress: (article: TArticleListItem) => void;
  className?: string;
};

/** Article summary card: cover (placeholder when missing / broken), title and summary on 2 lines each. */
export const ArticleCard = memo(function ArticleCard({ article, onPress, className }: TArticleCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = article.coverUrl !== null && !coverFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={article.title}
      accessibilityHint="Mở bài viết"
      onPress={() => onPress(article)}
      className={cn('overflow-hidden rounded-lg border border-border-subtle bg-card active:opacity-80', className)}
    >
      <View className="h-32 items-center justify-center bg-surface">
        {showCover ? (
          <Image
            source={{ uri: article.coverUrl ?? undefined }}
            contentFit="cover"
            onError={() => setCoverFailed(true)}
            // expo-image has no NativeWind interop → plain style.
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Icon name="leaf-outline" size="lg" color="mutedForeground" />
        )}
      </View>
      <View className="gap-1 p-3">
        {article.disease && (
          <Text numberOfLines={1} className={cn(TEXT.labelSmall, 'text-primary')}>
            {article.disease.nameVi}
          </Text>
        )}
        <Text numberOfLines={2} className={cn(TEXT.titleSmall, 'text-foreground')}>
          {article.title}
        </Text>
        <Text numberOfLines={2} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          {article.summary}
        </Text>
      </View>
    </Pressable>
  );
});
