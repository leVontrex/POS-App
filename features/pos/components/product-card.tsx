import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { InteractiveCard } from '@/features/pos/components/interactive-card';
import type { Product } from '@/features/pos/types';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <InteractiveCard onPress={onPress} style={[styles.card, { backgroundColor: product.color }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{product.category}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.actionText}>Tap to add</Text>
        <MaterialIcons color="#5D4037" name="add-circle" size={24} />
      </View>
    </InteractiveCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    minHeight: 170,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#8A5A44',
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B4F3B',
  },
  content: {
    gap: 8,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#402A1E',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5D4037',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5D4037',
  },
});
