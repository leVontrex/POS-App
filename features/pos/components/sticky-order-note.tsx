import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { InteractiveCard } from '@/features/pos/components/interactive-card';
import type { PosOrder } from '@/features/pos/types';

type StickyOrderNoteProps = {
  order: PosOrder;
  onComplete?: () => void;
  onDrag?: () => void;
};

export function StickyOrderNote({ order, onComplete, onDrag }: StickyOrderNoteProps) {
  return (
    <InteractiveCard hoverScale={1.02} style={styles.note}>
      <View style={styles.topRow}>
        <View style={styles.pin} />
        {onDrag ? (
          <Pressable
            onLongPress={Platform.OS === 'web' ? undefined : onDrag}
            onPressIn={Platform.OS === 'web' ? onDrag : undefined}
            style={styles.dragHandle}>
            <MaterialIcons color="#6D5A12" name="drag-indicator" size={18} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.orderId}>{order.id}</Text>
      <Text style={styles.status}>{order.statusLabel}</Text>

      <View style={styles.items}>
        {order.items.map((item) => (
          <Text key={`${order.id}-${item.id}`} style={styles.itemText}>
            {item.quantity} x {item.name}
          </Text>
        ))}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
        {onComplete ? (
          <Pressable onPress={onComplete} style={styles.doneButton}>
            <MaterialIcons color="#FFFBE2" name="check" size={18} />
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        ) : null}
      </View>
    </InteractiveCard>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: '#FFF4A8',
    borderRadius: 10,
    padding: 14,
    minHeight: 176,
    shadowColor: '#9D8B3B',
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E77F67',
  },
  dragHandle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  orderId: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#5D4A00',
  },
  status: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#7A680F',
  },
  items: {
    marginTop: 14,
    gap: 8,
    minHeight: 64,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5C4A00',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    gap: 12,
  },
  totalLabel: {
    color: '#7A680F',
    fontWeight: '700',
  },
  totalValue: {
    color: '#4F3D00',
    fontSize: 16,
    fontWeight: '900',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5C6D2A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  doneButtonText: {
    color: '#FFFBE2',
    fontWeight: '800',
  },
});
