import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { RenderItemParams } from 'react-native-draggable-flatlist';
import { ScaleDecorator } from 'react-native-draggable-flatlist/lib/commonjs/components/CellDecorators';
import DraggableFlatList from 'react-native-draggable-flatlist/lib/commonjs/components/DraggableFlatList';

import { StickyOrderNote } from '@/features/pos/components/sticky-order-note';
import { useOrderMonitorUi } from '@/features/pos/hooks/use-order-monitor-ui';
import type { PosOrder } from '@/features/pos/types';

export function OrderMonitorScreen() {
  const { orders, isHydrated, archiveOrder, reorderActiveOrders } = useOrderMonitorUi();
  const { width } = useWindowDimensions();
  const columns = width >= 1240 ? 4 : width >= 920 ? 3 : width >= 640 ? 2 : 1;
  const noteWidth =
    columns === 1 ? width - 40 : Math.max(200, Math.floor((width - 40 - (columns - 1) * 16) / columns));

  function renderItem({ item, drag, isActive }: RenderItemParams<PosOrder>) {
    return (
      <ScaleDecorator activeScale={1.03}>
        <View style={[styles.noteCell, { width: noteWidth }, isActive ? styles.noteCellActive : null]}>
          <StickyOrderNote
            onComplete={() => void archiveOrder(item.id)}
            onDrag={drag}
            order={item}
          />
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <View style={styles.screen}>
      {!isHydrated ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading orders...</Text>
        </View>
      ) : isHydrated && orders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No open orders</Text>
          <Text style={styles.emptyText}>Finished checkouts will appear here as sticky notes.</Text>
        </View>
      ) : (
        <DraggableFlatList
          activationDistance={8}
          contentContainerStyle={styles.content}
          columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
          data={orders}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          onDragEnd={({ data }) => {
            void reorderActiveOrders(data);
          }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2EDE3',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyCard: {
    margin: 20,
    backgroundColor: '#FFF8F1',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7D9C8',
  },
  emptyTitle: {
    color: '#3A261B',
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 6,
    color: '#8F7A6A',
    lineHeight: 20,
  },
  noteCell: {
    maxWidth: 340,
    paddingBottom: 16,
  },
  noteCellActive: {
    opacity: 0.84,
    transform: [{ rotate: '1.5deg' }],
  },
  columnWrapper: {
    gap: 16,
    justifyContent: 'flex-start',
  },
});
