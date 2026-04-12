export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  color: string;
  sortOrder: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice?: number;
};

export type OrderPayload = {
  json: string;
  xml: string;
};

export type PosOrder = {
  id: string;
  items: OrderItem[];
  total: number;
  statusLabel: string;
  createdAt: string;
  amountReceived: number;
  change: number;
  payload: OrderPayload;
};

export type StoredOrdersSnapshot = {
  activeOrders: PosOrder[];
  pastOrders: PosOrder[];
  nextOrderNumber: number;
};

export type StoredProductsSnapshot = {
  products: Product[];
  nextProductNumber: number;
};

export type AppStorageSnapshot = StoredOrdersSnapshot &
  StoredProductsSnapshot;
