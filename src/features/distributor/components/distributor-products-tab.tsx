import { useRouter } from 'expo-router';
import { useCallback, type ReactElement } from 'react';
import { View } from 'react-native';
import { useSession } from '@/features/auth';
import { ProductCard, ProductFormSheet, useDistributorProducts, type TDistributorProduct } from '@/features/product';
import { Button } from '@/shared/components/atoms';
import { InfiniteList } from '@/shared/components/organisms';
import { ROUTES } from '@/shared/constants';
import { useAppSheet } from '@/shared/lib/sheet';

const keyExtractor = (product: TDistributorProduct) => product.id;
const GRID_COLUMNS = 2;

export type TDistributorProductsTabProps = {
  distributorId: string;
  /** Above the grid (profile info + tabs) — kept while products load. */
  header?: ReactElement | null;
  className?: string;
};

/**
 * Tab "Sản Phẩm" (image-5): 2-column grid of the shop's products (ACTIVE only), infinite + pull-to-refresh; card →
 * product page. Owner: "Thêm sản phẩm" (M8) above the grid.
 */
export function DistributorProductsTab({ distributorId, header, className }: TDistributorProductsTabProps) {
  const router = useRouter();
  const { user } = useSession();
  const query = useDistributorProducts(distributorId);
  const createSheet = useAppSheet();
  const isOwner = user?.id === distributorId;

  const onOpen = useCallback((productId: string) => router.push(ROUTES.product(productId)), [router]);
  const renderItem = useCallback(
    (product: TDistributorProduct) => <ProductCard product={product} onPress={onOpen} />,
    [onOpen],
  );

  return (
    <>
      <InfiniteList
        query={query}
        items={query.data ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        columnWrapperClassName="gap-3 px-4"
        contentContainerClassName="gap-3 pb-4"
        header={
          <>
            {header}
            {isOwner && (
              <View className="flex-row justify-end px-4">
                <Button label="Thêm sản phẩm" variant="highlight" size="sm" onPress={createSheet.open} />
              </View>
            )}
          </>
        }
        keepHeader
        emptyIcon="cube-outline"
        emptyTitle="Chưa có sản phẩm"
        emptyDescription={isOwner ? 'Bấm "Thêm sản phẩm" để đăng sản phẩm đầu tiên.' : undefined}
        accessibilityLabel="Danh sách sản phẩm"
        className={className}
      />
      {isOwner && <ProductFormSheet sheetRef={createSheet.ref} onClose={createSheet.close} distributorId={distributorId} />}
    </>
  );
}
