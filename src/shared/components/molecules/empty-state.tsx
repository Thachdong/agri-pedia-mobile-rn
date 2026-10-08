import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { Icon, type TIconName } from '../atoms';

export type TEmptyStateProps = {
  title: string;
  description?: string;
  icon?: TIconName;
  /** Optional call to action under the text (e.g. a Button). */
  action?: ReactNode;
  className?: string;
};

/** Centered icon + title + description — empty lists and not-yet-available sections. */
export function EmptyState({ title, description, icon, action, className }: TEmptyStateProps) {
  return (
    <View className={cn('items-center justify-center gap-2 px-4 py-8', className)}>
      {icon && (
        <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-surface">
          <Icon name={icon} size="lg" color="mutedForeground" />
        </View>
      )}
      <Text className={cn(TEXT.titleSmall, 'text-center')}>{title}</Text>
      {description && <Text className={cn(TEXT.bodySmall, 'text-center text-muted-foreground')}>{description}</Text>}
      {action}
    </View>
  );
}
