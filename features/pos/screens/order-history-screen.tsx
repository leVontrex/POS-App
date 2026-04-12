import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { InteractiveCard } from '@/features/pos/components/interactive-card';
import { useOrderHistoryUi } from '@/features/pos/hooks/use-order-history-ui';
import type { PosOrder } from '@/features/pos/types';

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function OrderHistoryScreen() {
  const { orders, isHydrated } = useOrderHistoryUi();
  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(600, width - 40);

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Order History</Text>
          <Text style={styles.subtitle}>Tap an order to view the full transaction details.</Text>
        </View>

        {!isHydrated ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading history...</Text>
          </View>
        ) : null}

        {isHydrated && orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No completed orders yet</Text>
            <Text style={styles.emptyText}>
              Completed sticky notes will move into this history list.
            </Text>
          </View>
        ) : null}

        {orders.map((order) => (
          <View key={order.id} style={[styles.historyCardWrap, { width: cardWidth }]}>
            <InteractiveCard hoverScale={1.02} onPress={() => setSelectedOrder(order)} style={styles.historyCard}>
              <View style={styles.historyTopRow}>
                <Text style={styles.orderId}>Order {order.id}</Text>
                <Text style={styles.total}>${order.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.timestamp}>{formatTimestamp(order.createdAt)}</Text>
            </InteractiveCard>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
        transparent
        visible={selectedOrder !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Order {selectedOrder?.id}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedOrder ? formatTimestamp(selectedOrder.createdAt) : ''}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedOrder(null)} style={styles.closeButton}>
                <Text style={styles.closeIconText}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.receiptHeaderCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Order</Text>
                  <Text style={styles.summaryValue}>{selectedOrder?.id ?? '-'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount Received</Text>
                  <Text style={styles.summaryValue}>
                    ${selectedOrder?.amountReceived.toFixed(2) ?? '0.00'}
                  </Text>
                </View>
              </View>

              {selectedOrder?.items.map((item) => (
                <View key={`${selectedOrder.id}-${item.id}`} style={styles.detailRow}>
                  <View style={styles.detailTextBlock}>
                    <Text style={styles.detailName}>{item.name}</Text>
                    <Text style={styles.detailMeta}>Qty {item.quantity}</Text>
                  </View>
                  <Text style={styles.detailAmount}>
                    ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryValue}>${selectedOrder?.total.toFixed(2) ?? '0.00'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Change</Text>
                  <Text style={styles.summaryValue}>
                    ${selectedOrder?.change.toFixed(2) ?? '0.00'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <Pressable onPress={() => setSelectedOrder(null)} style={styles.bottomCloseButton}>
              <Text style={styles.closeButtonText}>Close Receipt</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3EFE8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
    alignItems: 'center',
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2E241D',
  },
  subtitle: {
    marginTop: 6,
    color: '#7E6D62',
    lineHeight: 20,
  },
  emptyCard: {
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
  historyCardWrap: {
    maxWidth: 600,
  },
  historyCard: {
    backgroundColor: '#FFFDFC',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6DDD3',
    shadowColor: '#8A5A44',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orderId: {
    color: '#2E241D',
    fontSize: 17,
    fontWeight: '900',
  },
  total: {
    color: '#B85042',
    fontSize: 18,
    fontWeight: '900',
  },
  timestamp: {
    marginTop: 8,
    color: '#7E6D62',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 23, 17, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '82%',
    backgroundColor: '#FAFAF8',
    borderRadius: 15,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E0DB',
    shadowColor: '#6F6259',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalTitle: {
    color: '#2E241D',
    fontSize: 24,
    fontWeight: '900',
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#7E6D62',
    fontWeight: '600',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EFEB',
  },
  closeIconText: {
    color: '#2E241D',
    fontWeight: '900',
  },
  closeButtonText: {
    color: '#FFFDFC',
    fontWeight: '800',
  },
  modalBody: {
    marginTop: 20,
  },
  receiptHeaderCard: {
    backgroundColor: '#FFFDFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD2',
  },
  detailTextBlock: {
    flex: 1,
  },
  detailName: {
    color: '#2E241D',
    fontSize: 16,
    fontWeight: '800',
  },
  detailMeta: {
    marginTop: 4,
    color: '#7E6D62',
    fontWeight: '600',
  },
  detailAmount: {
    color: '#B85042',
    fontWeight: '900',
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: '#FFFDFC',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: '#7E6D62',
    fontWeight: '700',
  },
  summaryValue: {
    color: '#2E241D',
    fontWeight: '900',
  },
  bottomCloseButton: {
    marginTop: 18,
    backgroundColor: '#2E241D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
