import { useEffect, useMemo, useState } from 'react';

import { usePosStore } from '@/features/pos/store/use-pos-store';
import type { Product } from '@/features/pos/types';

const INITIAL_RECEIVED = '0.00';

export function useOrderingUi() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [amountReceived, setAmountReceived] = useState(INITIAL_RECEIVED);
  const [checkoutError, setCheckoutError] = useState('');
  const products = usePosStore((state) => state.products);
  const cart = usePosStore((state) => state.cart);
  const addProductToCart = usePosStore((state) => state.addProductToCart);
  const decreaseProductQuantity = usePosStore((state) => state.decreaseProductQuantity);
  const removeProductFromCart = usePosStore((state) => state.removeProductFromCart);
  const completeCheckout = usePosStore((state) => state.completeCheckout);
  const hydrateAppData = usePosStore((state) => state.hydrateAppData);
  const isProcessingCheckout = usePosStore((state) => state.isProcessingCheckout);

  useEffect(() => {
    void hydrateAppData();
  }, [hydrateAppData]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const receivedValue = Number(amountReceived) || 0;
  const change = Math.max(receivedValue - total, 0);
  const shortfall = Math.max(total - receivedValue, 0);

  function addProduct(product: Product) {
    addProductToCart(product);
  }

  function decreaseProduct(productId: string) {
    decreaseProductQuantity(productId);
  }

  function removeProduct(productId: string) {
    removeProductFromCart(productId);
  }

  function resetCart() {
    setShowCheckout(false);
    setAmountReceived(INITIAL_RECEIVED);
    setCheckoutError('');
  }

  function openCheckout() {
    if (cart.length === 0) {
      return;
    }

    setShowCheckout(true);
  }

  async function finishCheckout() {
    setCheckoutError('');
    const result = await completeCheckout(receivedValue);

    if (!result.success) {
      setCheckoutError(result.error ?? 'Unable to complete checkout.');
      return;
    }

    resetCart();
  }

  function addCashAmount(amount: number) {
    const nextAmount = receivedValue + amount;
    setAmountReceived(nextAmount.toFixed(2));
    setCheckoutError('');
  }

  function clearAmountReceived() {
    setAmountReceived(INITIAL_RECEIVED);
    setCheckoutError('');
  }

  return {
    products,
    cart,
    total,
    showCheckout,
    amountReceived,
    change,
    shortfall,
    receivedValue,
    checkoutError,
    isProcessingCheckout,
    setAmountReceived,
    addCashAmount,
    clearAmountReceived,
    addProduct,
    decreaseProduct,
    removeProduct,
    resetCart,
    openCheckout,
    finishCheckout,
    closeCheckout: () => setShowCheckout(false),
  };
}
