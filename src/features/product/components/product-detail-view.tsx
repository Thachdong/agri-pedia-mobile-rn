import { ScrollView, View } from 'react-native';
import { useSession } from '@/features/auth';
import { ProductReviewsPanel } from '@/features/review';
import { cn } from '@/shared/lib/utils';
import { useProductDetail } from '../hooks/use-product-detail';
import { ProductDetailActions } from './product-detail-actions';
import { ProductDetailInfo } from './product-detail-info';

export type TProductDetailViewProps = { productId: string; className?: string };

/**
 * The product page body: ONE list whose header is the product info + actions, then its rating and reviews (infinite).
 * Product not loaded / not found → only the info part (its own loading / error).
 */
export function ProductDetailView({ productId, className }: TProductDetailViewProps) {
  const { user } = useSession();
  const { data: product, isSuccess } = useProductDetail(productId);
  const isOwner = !!user && user.id === product?.distributorId;

  const info = (
    <View className="px-4 pb-2 pt-4">
      <ProductDetailInfo productId={productId} isOwner={isOwner} actions={<ProductDetailActions productId={productId} />} />
    </View>
  );

  if (!isSuccess) {
    return (
      <ScrollView className={cn('flex-1', className)} contentContainerClassName="grow">
        {info}
      </ScrollView>
    );
  }

  return <ProductReviewsPanel productId={productId} currentUserId={user?.id} header={info} className={className} />;
}
