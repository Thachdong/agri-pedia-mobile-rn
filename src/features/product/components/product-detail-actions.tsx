import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { LoginRequiredSheet, useSession } from '@/features/auth';
import { ReviewSheet, useProductReviews } from '@/features/review';
import { Button } from '@/shared/components/atoms';
import { ConfirmSheet } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { getErrorMessage } from '@/shared/lib/http';
import { useAppSheet } from '@/shared/lib/sheet';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { useProductDetail } from '../hooks/use-product-detail';
import { ProductFormSheet } from './product-form-sheet';

export type TProductDetailActionsProps = { productId: string; className?: string };

/**
 * Buttons of the product detail (ui-ux.md §7, decision 8): owner → Sửa (M9) + Xoá (confirm → back to the previous
 * screen) · FARMER → Đánh giá sản phẩm (M5; own review already loaded → "Đã đánh giá", disabled) · guest → M1 ·
 * another DISTRIBUTOR → none. Review only while the product is on sale (else the server answers 422). Nothing while the
 * session or the product loads.
 */
export function ProductDetailActions({ productId, className }: TProductDetailActionsProps) {
  const router = useRouter();
  const session = useSession();
  const { data: product } = useProductDetail(productId);
  const { data: reviews } = useProductReviews(productId);
  const deletion = useDeleteProduct(session.user?.id ?? '');
  const loginSheet = useAppSheet();
  const reviewSheet = useAppSheet();
  const editSheet = useAppSheet();
  const deleteSheet = useAppSheet();

  if (session.status === 'loading' || !product) return null;
  const { user } = session;

  if (user?.id === product.distributorId) {
    const onDelete = () =>
      deletion.mutate(product.id, {
        onSuccess: () => {
          deleteSheet.close();
          toast.success('Đã xoá sản phẩm');
          if (router.canGoBack()) router.back();
          else router.replace(ROUTES.profile(product.distributorId));
        },
      });
    return (
      <View className={cn('flex-row gap-2', className)}>
        <Button label="Sửa" variant="outline" size="sm" onPress={editSheet.open} />
        <Button label="Xoá" variant="outline" size="sm" onPress={deleteSheet.open} />
        <ProductFormSheet
          sheetRef={editSheet.ref}
          onClose={editSheet.close}
          distributorId={product.distributorId}
          product={product}
        />
        <ConfirmSheet
          sheetRef={deleteSheet.ref}
          onClose={deleteSheet.close}
          title="Xoá sản phẩm?"
          description={`"${product.name}" sẽ bị xoá khỏi shop cùng toàn bộ ảnh. Không thể hoàn tác.`}
          confirmLabel="Xoá"
          onConfirm={onDelete}
          loading={deletion.isPending}
          error={deletion.isError ? getErrorMessage(deletion.error) : undefined}
          onDismiss={deletion.reset}
        />
      </View>
    );
  }

  if ((user && user.role !== 'FARMER') || product.status !== 'ACTIVE') return null;

  const alreadyReviewed = !!user && !!reviews?.some((review) => review.user.id === user.id);

  return (
    <View className={cn('flex-row', className)}>
      <Button
        label={alreadyReviewed ? 'Đã đánh giá' : 'Đánh giá sản phẩm'}
        variant="highlight"
        size="sm"
        disabled={alreadyReviewed}
        onPress={user ? reviewSheet.open : loginSheet.open}
      />
      {user ? (
        <ReviewSheet
          sheetRef={reviewSheet.ref}
          onClose={reviewSheet.close}
          targetType="PRODUCT"
          targetId={product.id}
          targetName={product.name}
        />
      ) : (
        <LoginRequiredSheet
          sheetRef={loginSheet.ref}
          onClose={loginSheet.close}
          description="Đăng nhập để đánh giá sản phẩm."
        />
      )}
    </View>
  );
}
