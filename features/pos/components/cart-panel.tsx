import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CartItem } from '@/features/pos/types';

type CartPanelProps = {
  cart: CartItem[];
  total: number;
  showCheckout: boolean;
  amountReceived: string;
  change: number;
  shortfall: number;
  checkoutError: string;
  isProcessingCheckout: boolean;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onOpenCheckout: () => void;
  onCloseCheckout: () => void;
  onAddCashAmount: (amount: number) => void;
  onAmountReceivedChange: (value: string) => void;
  onClearAmountReceived: () => void;
  onCompleteCheckout: () => void;
};

const BILL_AMOUNTS = [5, 10, 20, 50];
const COIN_AMOUNTS = [1, 2];

export function CartPanel({
  cart,
  total,
  showCheckout,
  amountReceived,
  change,
  shortfall,
  checkoutError,
  isProcessingCheckout,
  onDecrease,
  onRemove,
  onOpenCheckout,
  onCloseCheckout,
  onAddCashAmount,
  onAmountReceivedChange,
  onClearAmountReceived,
  onCompleteCheckout,
}: CartPanelProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.eyebrow}>Live Cart</Text>
          <Text style={styles.title}>{itemCount} items in progress</Text>
        </View>
        <View style={styles.totalChip}>
          <MaterialIcons color="#B85042" name="payments" size={18} />
          <Text style={styles.totalChipText}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.items}>
        {cart.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons color="#BFA88E" name="shopping-basket" size={32} />
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyText}>Tap a product card to start a fresh order.</Text>
          </View>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.cartRow}>
              <View style={styles.rowText}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} x ${item.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.rowActions}>
                <Text style={styles.rowTotal}>${(item.quantity * item.price).toFixed(2)}</Text>
                <View style={styles.actionButtons}>
                  <Pressable onPress={() => onDecrease(item.id)} style={styles.iconButton}>
                    <MaterialIcons color="#6B4F3B" name="remove" size={18} />
                  </Pressable>
                  <Pressable onPress={() => onRemove(item.id)} style={styles.deleteButton}>
                    <MaterialIcons color="#B85042" name="delete-outline" size={18} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>Included</Text>
        </View>
      </View>

      {showCheckout ? (
        <View style={styles.checkoutCard}>
          <View style={styles.checkoutHeader}>
            <Text style={styles.checkoutTitle}>Checkout preview</Text>
            <Pressable onPress={onCloseCheckout}>
              <MaterialIcons color="#6B4F3B" name="close" size={20} />
            </Pressable>
          </View>

          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Amount received</Text>
            <Pressable onPress={onClearAmountReceived} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          </View>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={onAmountReceivedChange}
            placeholder="0.00"
            placeholderTextColor="#9A8777"
            style={styles.input}
            value={amountReceived}
          />

          <View style={styles.cashSection}>
            <Text style={styles.cashSectionLabel}>Bills</Text>
            <View style={styles.cashGrid}>
              {BILL_AMOUNTS.map((amount) => (
                <Pressable
                  key={`bill-${amount}`}
                  onPress={() => onAddCashAmount(amount)}
                  style={[styles.cashButton, styles.billButton]}>
                  <Text style={styles.billButtonText}>{amount}EUR</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.cashSection}>
            <Text style={styles.cashSectionLabel}>Coins</Text>
            <View style={styles.cashGrid}>
              {COIN_AMOUNTS.map((amount) => (
                <Pressable
                  key={`coin-${amount}`}
                  onPress={() => onAddCashAmount(amount)}
                  style={[styles.cashButton, styles.coinButton]}>
                  <Text style={styles.coinButtonText}>{amount}EUR</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.checkoutStats}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Change</Text>
              <Text style={styles.statValue}>${change.toFixed(2)}</Text>
            </View>
            <View style={[styles.statCard, shortfall > 0 ? styles.warningCard : null]}>
              <Text style={styles.statLabel}>Missing</Text>
              <Text style={styles.statValue}>${shortfall.toFixed(2)}</Text>
            </View>
          </View>

          {checkoutError ? <Text style={styles.errorText}>{checkoutError}</Text> : null}

          <Pressable
            disabled={isProcessingCheckout || shortfall > 0}
            onPress={onCompleteCheckout}
            style={[
              styles.completeButton,
              isProcessingCheckout || shortfall > 0 ? styles.completeButtonDisabled : null,
            ]}>
            <Text style={styles.completeButtonText}>
              {isProcessingCheckout ? 'Saving...' : 'Finish Order'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          disabled={cart.length === 0}
          onPress={onOpenCheckout}
          style={[styles.checkoutButton, cart.length === 0 ? styles.checkoutButtonDisabled : null]}>
          <Text style={styles.checkoutButtonText}>Open checkout</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFF8F1',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E9DCCF',
    shadowColor: '#8A5A44',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    gap: 18,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#B85042',
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: '#3A261B',
  },
  totalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDEBDD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalChipText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B85042',
  },
  items: {
    gap: 12,
  },
  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E3CDBB',
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B4F3B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8F7A6A',
    lineHeight: 20,
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5D9CD',
    paddingBottom: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A261B',
  },
  itemMeta: {
    color: '#8F7A6A',
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: 8,
    justifyContent: 'center',
  },
  rowTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B4F3B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7ECE2',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCE3DD',
  },
  summaryBlock: {
    backgroundColor: '#FFFDFC',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#7D6656',
    fontWeight: '600',
  },
  summaryValue: {
    color: '#3A261B',
    fontWeight: '800',
  },
  checkoutButton: {
    backgroundColor: '#B85042',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D8B4A7',
  },
  checkoutButtonText: {
    color: '#FFF9F5',
    fontSize: 16,
    fontWeight: '800',
  },
  checkoutCard: {
    borderRadius: 24,
    backgroundColor: '#FBEADF',
    padding: 18,
    gap: 12,
  },
  checkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3A261B',
  },
  inputLabel: {
    color: '#7D6656',
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#F1E3D7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#6B4F3B',
    fontWeight: '800',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7D5C5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#3A261B',
  },
  cashSection: {
    gap: 8,
  },
  cashSectionLabel: {
    color: '#7D6656',
    fontWeight: '800',
  },
  cashGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cashButton: {
    minWidth: 86,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billButton: {
    backgroundColor: '#4E8F63',
  },
  billButtonText: {
    color: '#F5FFF7',
    fontWeight: '900',
    fontSize: 15,
  },
  coinButton: {
    backgroundColor: '#C9A64F',
  },
  coinButtonText: {
    color: '#3A261B',
    fontWeight: '900',
    fontSize: 15,
  },
  checkoutStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF8F1',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  warningCard: {
    backgroundColor: '#FFF2E6',
  },
  statLabel: {
    color: '#8F7A6A',
    fontWeight: '700',
  },
  statValue: {
    color: '#3A261B',
    fontWeight: '800',
    fontSize: 18,
  },
  completeButton: {
    backgroundColor: '#3A261B',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#8E7C72',
  },
  completeButtonText: {
    color: '#FFF8F1',
    fontWeight: '800',
    fontSize: 15,
  },
  errorText: {
    color: '#B85042',
    fontWeight: '700',
  },
});
