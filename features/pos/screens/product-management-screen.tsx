import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import type { RenderItemParams } from 'react-native-draggable-flatlist';
import DraggableFlatList from 'react-native-draggable-flatlist/lib/commonjs/components/DraggableFlatList';
import { ScaleDecorator } from 'react-native-draggable-flatlist/lib/commonjs/components/CellDecorators';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { InventoryProductCard } from '@/features/pos/components/inventory-product-card';
import { useProductManagementUi } from '@/features/pos/hooks/use-product-management-ui';
import type { Product } from '@/features/pos/types';

const COLOR_PRESETS = ['#F5D6BA', '#D2E4F2', '#D9E9C5', '#F6E2A4', '#F2D0C7', '#F9D4DA'];

export function ProductManagementScreen() {
  const {
    products,
    isHydrated,
    isModalVisible,
    isEditing,
    form,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    updateField,
    submitForm,
    deleteProduct,
    reorderProducts,
  } = useProductManagementUi();
  const { width } = useWindowDimensions();
  const columns = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
  const availableWidth = Math.min(width, 1100) - 40;
  const cardWidth =
    columns === 1 ? availableWidth : Math.max(220, Math.floor((availableWidth - (columns - 1) * 14) / columns));

  const sortedProducts = useMemo(
    () => [...products].sort((left, right) => left.sortOrder - right.sortOrder),
    [products]
  );

  function renderItem({ item, drag, isActive }: RenderItemParams<Product>) {
    return (
      <ScaleDecorator activeScale={1.03}>
        <View style={[styles.itemSpacing, { width: cardWidth }, isActive ? styles.itemActive : null]}>
          <InventoryProductCard
            onDelete={() => deleteProduct(item.id)}
            onPress={() => openEditModal(item)}
            onLongPress={drag}
            product={item}
          />
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Create, edit, delete, and reorder products for the POS.</Text>
        </View>
        <Pressable onPress={openCreateModal} style={styles.addButton}>
          <MaterialIcons color="#FFF8F1" name="add" size={18} />
          <Text style={styles.addButtonText}>New Product</Text>
        </Pressable>
      </View>

      {!isHydrated ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading inventory...</Text>
        </View>
      ) : sortedProducts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptyText}>Add your first product to populate the ordering screen.</Text>
        </View>
      ) : (
        <DraggableFlatList
          activationDistance={8}
          contentContainerStyle={styles.listContent}
          data={sortedProducts}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          onDragEnd={({ data }) => {
            void reorderProducts(data);
          }}
          renderItem={renderItem}
        />
      )}

      <Modal animationType="slide" onRequestClose={closeModal} transparent visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
              <Pressable onPress={closeModal} style={styles.iconCloseButton}>
                <MaterialIcons color="#3A261B" name="close" size={20} />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput onChangeText={(value) => updateField('name', value)} style={styles.input} value={form.name} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                onChangeText={(value) => updateField('category', value)}
                style={styles.input}
                value={form.category}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formField]}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => updateField('price', value)}
                  style={styles.input}
                  value={form.price}
                />
              </View>

              <View style={[styles.formGroup, styles.formField]}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  onChangeText={(value) => updateField('color', value)}
                  style={styles.input}
                  value={form.color}
                />
              </View>
            </View>

            <View style={styles.colorPresets}>
              {COLOR_PRESETS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateField('color', color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    form.color === color ? styles.colorSwatchActive : null,
                  ]}
                />
              ))}
            </View>

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <Pressable onPress={() => void submitForm()} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Create Product'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3EFE8',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#2E241D',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: '#7E6D62',
    lineHeight: 20,
    maxWidth: 520,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B85042',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#FFF8F1',
    fontWeight: '800',
  },
  emptyCard: {
    marginHorizontal: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  itemSpacing: {
    paddingHorizontal: 7,
    paddingBottom: 14,
  },
  itemActive: {
    opacity: 0.98,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 23, 17, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF8F1',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#8A5A44',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#2E241D',
    fontSize: 24,
    fontWeight: '900',
  },
  iconCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6EDE4',
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#6B4F3B',
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4D7C8',
    borderRadius: 16,
    backgroundColor: '#FFFDFC',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#2E241D',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  colorPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#3A261B',
  },
  errorText: {
    color: '#B85042',
    fontWeight: '700',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#3A261B',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF8F1',
    fontSize: 15,
    fontWeight: '800',
  },
});
