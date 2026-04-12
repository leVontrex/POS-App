import { useEffect } from 'react';

import { usePosStore } from '@/features/pos/store/use-pos-store';

export function useOrderHistoryUi() {
  const orders = usePosStore((state) => state.pastOrders);
  const isHydrated = usePosStore((state) => state.isHydrated);
  const hydrateAppData = usePosStore((state) => state.hydrateAppData);

  useEffect(() => {
    void hydrateAppData();
  }, [hydrateAppData]);

  return {
    orders,
    isHydrated,
  };
}
