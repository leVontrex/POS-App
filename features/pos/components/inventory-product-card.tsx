import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InteractiveCard } from '@/features/pos/components/interactive-card';
import type { Product } from '@/features/pos/types';

type InventoryProductCardProps = {
  product: Product;
  onPress: () => void;
  onDelete: () => void;
  onLongPress: () => void;
};

export function InventoryProductCard({
  product,
  onPress,
  onDelete,
  onLongPress,
}: InventoryProductCardProps) {
  return (
    <InteractiveCard
      hoverScale={1.02}
      onLongPress={onLongPress}
      onPress={onPress}
      style={[styles.card, { backgroundColor: product.color }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.orderText}>Position {product.sortOrder + 1}</Text>
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <MaterialIcons color="#B85042" name="delete-outline" size={18} />
        </Pressable>
      </View>
    </InteractiveCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    shadowColor: '#8A5A44',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    color: '#2E241D',
    fontSize: 17,
    fontWeight: '900',
  },
  category: {
    marginTop: 4,
    color: '#6B4F3B',
    fontWeight: '700',
  },
  price: {
    color: '#3A261B',
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderText: {
    color: '#6B4F3B',
    fontWeight: '700',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,244,240,0.86)',
  },
});
