import { create } from 'zustand';

import { StorageService, createSerializedOrder } from '@/features/pos/services/storage-service';
import type { CartItem, PosOrder, Product } from '@/features/pos/types';

type PosStoreState = {
  products: Product[];
  cart: CartItem[];
  activeOrders: PosOrder[];
  pastOrders: PosOrder[];
  nextOrderNumber: number;
  nextProductNumber: number;
  isHydrated: boolean;
  isProcessingCheckout: boolean;
  hydrateAppData: () => Promise<void>;
  addProductToCart: (product: Product) => void;
  decreaseProductQuantity: (productId: string) => void;
  removeProductFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (input: Omit<Product, 'id' | 'sortOrder'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  reorderProducts: (products: Product[]) => Promise<void>;
  completeCheckout: (amountReceived: number) => Promise<{ success: boolean; error?: string }>;
  archiveOrder: (orderId: string) => Promise<void>;
  reorderActiveOrders: (nextOrders: PosOrder[]) => Promise<void>;
};

function normalizeProductOrder(products: Product[]) {
  return products.map((product, index) => ({
    ...product,
    sortOrder: index,
  }));
}

export const usePosStore = create<PosStoreState>((set, get) => ({
  products: [],
  cart: [],
  activeOrders: [],
  pastOrders: [],
  nextOrderNumber: 101,
  nextProductNumber: 1,
  isHydrated: false,
  isProcessingCheckout: false,

  hydrateAppData: async () => {
    if (get().isHydrated) {
      return;
    }

    const snapshot = await StorageService.loadAppSnapshot();

    set({
      products: snapshot.products,
      activeOrders: snapshot.activeOrders,
      pastOrders: snapshot.pastOrders,
      nextOrderNumber: snapshot.nextOrderNumber,
      nextProductNumber: snapshot.nextProductNumber,
      isHydrated: true,
    });
  },

  addProductToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);

      if (!existingItem) {
        return {
          cart: [...state.cart, { ...product, quantity: 1 }],
        };
      }

      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }),

  decreaseProductQuantity: (productId) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeProductFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),

  clearCart: () => set({ cart: [] }),

  addProduct: async (input) => {
    const { products, nextProductNumber } = get();
    const nextProducts = normalizeProductOrder([
      ...products,
      {
        ...input,
        id: `product-${nextProductNumber}`,
        sortOrder: products.length,
      },
    ]);
    const upcomingProductNumber = nextProductNumber + 1;

    await StorageService.saveProductSnapshot(nextProducts, upcomingProductNumber);

    set({
      products: nextProducts,
      nextProductNumber: upcomingProductNumber,
    });
  },

  updateProduct: async (product) => {
    const { products, nextProductNumber } = get();
    const nextProducts = normalizeProductOrder(
      products
        .map((currentProduct) => (currentProduct.id === product.id ? product : currentProduct))
        .sort((left, right) => left.sortOrder - right.sortOrder)
    );

    await StorageService.saveProductSnapshot(nextProducts, nextProductNumber);

    set({
      products: nextProducts,
    });
  },

  deleteProduct: async (productId) => {
    const { products, cart, nextProductNumber } = get();
    const nextProducts = normalizeProductOrder(products.filter((product) => product.id !== productId));

    await StorageService.saveProductSnapshot(nextProducts, nextProductNumber);

    set({
      products: nextProducts,
      cart: cart.filter((item) => item.id !== productId),
    });
  },

  reorderProducts: async (products) => {
    const { nextProductNumber } = get();
    const nextProducts = normalizeProductOrder(products);

    set({
      products: nextProducts,
    });

    await StorageService.saveProductSnapshot(nextProducts, nextProductNumber);
  },

  completeCheckout: async (amountReceived) => {
    const { cart, activeOrders, pastOrders, nextOrderNumber } = get();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    if (amountReceived < total) {
      return { success: false, error: 'Amount received is smaller than the order total.' };
    }

    set({ isProcessingCheckout: true });

    try {
      const order = createSerializedOrder({
        id: String(nextOrderNumber),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        total,
        statusLabel: 'Open Order',
        createdAt: new Date().toISOString(),
        amountReceived,
        change: amountReceived - total,
      });

      const nextActiveOrders = [...activeOrders, order];
      const upcomingOrderNumber = nextOrderNumber + 1;

      await StorageService.saveOrderSnapshot({
        activeOrders: nextActiveOrders,
        pastOrders,
        nextOrderNumber: upcomingOrderNumber,
      });

      set({
        activeOrders: nextActiveOrders,
        cart: [],
        nextOrderNumber: upcomingOrderNumber,
        isProcessingCheckout: false,
      });

      return { success: true };
    } catch (error) {
      set({ isProcessingCheckout: false });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to save the order.',
      };
    }
  },

  archiveOrder: async (orderId) => {
    const { activeOrders, pastOrders, nextOrderNumber } = get();
    const orderToArchive = activeOrders.find((order) => order.id === orderId);

    if (!orderToArchive) {
      return;
    }

    const nextActiveOrders = activeOrders.filter((order) => order.id !== orderId);
    const nextPastOrders = [orderToArchive, ...pastOrders];

    await StorageService.saveOrderSnapshot({
      activeOrders: nextActiveOrders,
      pastOrders: nextPastOrders,
      nextOrderNumber,
    });

    set({
      activeOrders: nextActiveOrders,
      pastOrders: nextPastOrders,
    });
  },

  reorderActiveOrders: async (nextOrders) => {
    const { pastOrders, nextOrderNumber } = get();

    set({
      activeOrders: nextOrders,
    });

    await StorageService.saveOrderSnapshot({
      activeOrders: nextOrders,
      pastOrders,
      nextOrderNumber,
    });
  },
}));
