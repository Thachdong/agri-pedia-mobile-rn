import { cva } from 'class-variance-authority';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';

const avatarVariants = cva('items-center justify-center overflow-hidden rounded-full bg-highlight-subtle', {
  variants: { size: { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16' } },
  defaultVariants: { size: 'md' },
});

const initialVariants = cva('font-semibold text-highlight', {
  variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-xl' } },
  defaultVariants: { size: 'md' },
});

export type TAvatarProps = {
  /** Image URL; `null`/empty or a failed load (expired signed URL) → initial of `name`. */
  src?: string | null;
  /** Display name — accessibility label + fallback initial. */
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const getInitial = (name: string) => name.trim().charAt(0).toLocaleUpperCase('vi-VN') || '?';

export function Avatar({ src, name, size = 'md', className }: TAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;

  return (
    <View accessibilityRole="image" accessibilityLabel={name} className={cn(avatarVariants({ size }), className)}>
      {showImage ? (
        <Image
          source={{ uri: src }}
          contentFit="cover"
          transition={150}
          onError={() => setFailedSrc(src)}
          // expo-image has no NativeWind interop → plain style.
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Text className={initialVariants({ size })}>{getInitial(name)}</Text>
      )}
    </View>
  );
}
