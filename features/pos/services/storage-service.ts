import AsyncStorage from '@react-native-async-storage/async-storage';

import seedOrders from '@/features/pos/data/orders.json';
import seedProducts from '@/features/pos/data/products.json';
import type { AppStorageSnapshot, PosOrder, Product, StoredOrdersSnapshot } from '@/features/pos/types';

const STORAGE_KEYS = {
  activeOrders: 'pos.activeOrders',
  pastOrders: 'pos.pastOrders',
  nextOrderNumber: 'pos.nextOrderNumber',
  products: 'pos.products',
  nextProductNumber: 'pos.nextProductNumber',
} as const;

const INITIAL_ORDER_NUMBER = 101;
const INITIAL_PRODUCT_NUMBER = 1;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildOrderXml(order: Omit<PosOrder, 'payload'>) {
  const items = order.items
    .map(
      (item) =>
        `<item id="${escapeXml(item.id)}" quantity="${item.quantity}" unitPrice="${item.unitPrice ?? 0}"><name>${escapeXml(item.name)}</name></item>`
    )
    .join('');

  return `<order id="${escapeXml(order.id)}"><createdAt>${escapeXml(order.createdAt)}</createdAt><status>${escapeXml(order.statusLabel)}</status><total>${order.total.toFixed(2)}</total><amountReceived>${order.amountReceived.toFixed(2)}</amountReceived><change>${order.change.toFixed(2)}</change><items>${items}</items></order>`;
}

export function createSerializedOrder(
  order: Omit<PosOrder, 'payload'>
): PosOrder {
  const json = JSON.stringify(order);
  const xml = buildOrderXml(order);

  return {
    ...order,
    payload: {
      json,
      xml,
    },
  };
}

function normalizeSeedOrders(): PosOrder[] {
  return (seedOrders as Array<{
    id: string;
    items: Array<{ id: string; name: string; quantity: number }>;
    total: number;
    statusLabel: string;
  }>).map((order, index) =>
    createSerializedOrder({
      id: String(INITIAL_ORDER_NUMBER + index),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: 0,
      })),
      total: order.total,
      statusLabel: order.statusLabel,
      createdAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
      amountReceived: order.total,
      change: 0,
    })
  );
}

function normalizeSeedProducts(): Product[] {
  return (seedProducts as Product[])
    .map((product, index) => ({
      ...product,
      sortOrder: product.sortOrder ?? index,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

async function readJson<T>(key: string) {
  const value = await AsyncStorage.getItem(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
}

async function readNextNumber(key: string) {
  const value = await AsyncStorage.getItem(key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function writeNextNumber(key: string, nextNumber: number) {
  await AsyncStorage.setItem(key, String(nextNumber));
}

function getHighestOrderNumber(orders: PosOrder[]) {
  return orders.reduce((highest, order) => {
    const parsed = Number(order.id);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, INITIAL_ORDER_NUMBER - 1);
}

function getHighestProductNumber(products: Product[]) {
  return products.reduce((highest, product) => {
    const parsed = Number(product.id.replace('product-', ''));
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, INITIAL_PRODUCT_NUMBER - 1);
}

export const StorageService = {
  async loadAppSnapshot(): Promise<AppStorageSnapshot> {
    const [activeOrders, pastOrders, storedNextOrderNumber, storedProducts, storedNextProductNumber] =
      await Promise.all([
        readJson<PosOrder[]>(STORAGE_KEYS.activeOrders),
        readJson<PosOrder[]>(STORAGE_KEYS.pastOrders),
        readNextNumber(STORAGE_KEYS.nextOrderNumber),
        readJson<Product[]>(STORAGE_KEYS.products),
        readNextNumber(STORAGE_KEYS.nextProductNumber),
      ]);

    if (!activeOrders && !pastOrders && !storedProducts) {
      const seededOrders = normalizeSeedOrders();
      const seededProducts = normalizeSeedProducts();
      const nextOrderNumber = INITIAL_ORDER_NUMBER + seededOrders.length;
      const nextProductNumber = INITIAL_PRODUCT_NUMBER + seededProducts.length;

      await Promise.all([
        writeJson(STORAGE_KEYS.activeOrders, seededOrders),
        writeJson(STORAGE_KEYS.pastOrders, []),
        writeNextNumber(STORAGE_KEYS.nextOrderNumber, nextOrderNumber),
        writeJson(STORAGE_KEYS.products, seededProducts),
        writeNextNumber(STORAGE_KEYS.nextProductNumber, nextProductNumber),
      ]);

      return {
        activeOrders: seededOrders,
        pastOrders: [],
        nextOrderNumber,
        products: seededProducts,
        nextProductNumber,
      };
    }

    const products = (storedProducts ?? normalizeSeedProducts()).sort(
      (left, right) => left.sortOrder - right.sortOrder
    );
    const allOrders = [...(activeOrders ?? []), ...(pastOrders ?? [])];
    const nextOrderNumber =
      storedNextOrderNumber ??
      (getHighestOrderNumber(allOrders) >= INITIAL_ORDER_NUMBER
        ? getHighestOrderNumber(allOrders) + 1
        : INITIAL_ORDER_NUMBER);
    const nextProductNumber =
      storedNextProductNumber ??
      (getHighestProductNumber(products) >= INITIAL_PRODUCT_NUMBER
        ? getHighestProductNumber(products) + 1
        : INITIAL_PRODUCT_NUMBER);

    if (storedNextOrderNumber == null || storedProducts == null || storedNextProductNumber == null) {
      await Promise.all([
        storedNextOrderNumber == null
          ? writeNextNumber(STORAGE_KEYS.nextOrderNumber, nextOrderNumber)
          : Promise.resolve(),
        storedProducts == null ? writeJson(STORAGE_KEYS.products, products) : Promise.resolve(),
        storedNextProductNumber == null
          ? writeNextNumber(STORAGE_KEYS.nextProductNumber, nextProductNumber)
          : Promise.resolve(),
      ]);
    }

    return {
      activeOrders: activeOrders ?? [],
      pastOrders: pastOrders ?? [],
      nextOrderNumber,
      products,
      nextProductNumber,
    };
  },

  async loadOrderSnapshot(): Promise<StoredOrdersSnapshot> {
    const snapshot = await this.loadAppSnapshot();

    return {
      activeOrders: snapshot.activeOrders,
      pastOrders: snapshot.pastOrders,
      nextOrderNumber: snapshot.nextOrderNumber,
    };
  },

  async saveOrderSnapshot(snapshot: StoredOrdersSnapshot) {
    await Promise.all([
      writeJson(STORAGE_KEYS.activeOrders, snapshot.activeOrders),
      writeJson(STORAGE_KEYS.pastOrders, snapshot.pastOrders),
      writeNextNumber(STORAGE_KEYS.nextOrderNumber, snapshot.nextOrderNumber),
    ]);
  },

  async saveProductSnapshot(products: Product[], nextProductNumber: number) {
    await Promise.all([
      writeJson(STORAGE_KEYS.products, products),
      writeNextNumber(STORAGE_KEYS.nextProductNumber, nextProductNumber),
    ]);
  },
};
