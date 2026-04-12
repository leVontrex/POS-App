import { useEffect } from 'react';

import { usePosStore } from '@/features/pos/store/use-pos-store';

export function useOrderMonitorUi() {
  const orders = usePosStore((state) => state.activeOrders);
  const isHydrated = usePosStore((state) => state.isHydrated);
  const hydrateAppData = usePosStore((state) => state.hydrateAppData);
  const archiveOrder = usePosStore((state) => state.archiveOrder);
  const reorderActiveOrders = usePosStore((state) => state.reorderActiveOrders);

  useEffect(() => {
    void hydrateAppData();
  }, [hydrateAppData]);

  return {
    orders,
    isHydrated,
    archiveOrder,
    reorderActiveOrders,
  };
}
