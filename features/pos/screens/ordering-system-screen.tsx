import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { CartPanel } from '@/features/pos/components/cart-panel';
import { ProductCard } from '@/features/pos/components/product-card';
import { useOrderingUi } from '@/features/pos/hooks/use-ordering-ui';

export function OrderingSystemScreen() {
  const {
    products,
    cart,
    total,
    showCheckout,
    amountReceived,
    change,
    shortfall,
    checkoutError,
    isProcessingCheckout,
    setAmountReceived,
    addCashAmount,
    clearAmountReceived,
    addProduct,
    decreaseProduct,
    removeProduct,
    openCheckout,
    finishCheckout,
    closeCheckout,
  } = useOrderingUi();
  const { width } = useWindowDimensions();

  const isWide = width >= 1024;
  const productColumns = width >= 1320 ? 3 : width >= 720 ? 2 : 1;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={[styles.mainLayout, isWide ? styles.mainLayoutWide : null]}>
        <View style={styles.leftColumn}>
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.productCell,
                  { width: productColumns === 1 ? '100%' : `${100 / productColumns}%` },
                ]}>
                <ProductCard onPress={() => addProduct(product)} product={product} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rightColumn}>
          <CartPanel
            amountReceived={amountReceived}
            cart={cart}
            change={change}
            checkoutError={checkoutError}
            isProcessingCheckout={isProcessingCheckout}
            onAddCashAmount={addCashAmount}
            onAmountReceivedChange={setAmountReceived}
            onClearAmountReceived={clearAmountReceived}
            onCompleteCheckout={finishCheckout}
            onCloseCheckout={closeCheckout}
            onDecrease={decreaseProduct}
            onOpenCheckout={openCheckout}
            onRemove={removeProduct}
            shortfall={shortfall}
            showCheckout={showCheckout}
            total={total}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6EFE7',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  mainLayout: {
    gap: 20,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1.5,
  },
  rightColumn: {
    flex: 0.9,
    minWidth: 320,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  productCell: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});
