import { useEffect, useMemo, useState } from 'react';

import { usePosStore } from '@/features/pos/store/use-pos-store';
import type { Product } from '@/features/pos/types';

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  color: string;
};

const INITIAL_FORM: ProductFormState = {
  name: '',
  category: '',
  price: '',
  color: '#F5D6BA',
};

function mapProductToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    color: product.color,
  };
}

export function useProductManagementUi() {
  const products = usePosStore((state) => state.products);
  const isHydrated = usePosStore((state) => state.isHydrated);
  const hydrateAppData = usePosStore((state) => state.hydrateAppData);
  const addProduct = usePosStore((state) => state.addProduct);
  const updateProduct = usePosStore((state) => state.updateProduct);
  const deleteProductAction = usePosStore((state) => state.deleteProduct);
  const reorderProducts = usePosStore((state) => state.reorderProducts);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    void hydrateAppData();
  }, [hydrateAppData]);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [editingProductId, products]
  );

  function openCreateModal() {
    setEditingProductId(null);
    setForm(INITIAL_FORM);
    setFormError('');
    setIsModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingProductId(product.id);
    setForm(mapProductToForm(product));
    setFormError('');
    setIsModalVisible(true);
  }

  function closeModal() {
    setIsModalVisible(false);
    setEditingProductId(null);
    setForm(INITIAL_FORM);
    setFormError('');
  }

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submitForm() {
    const price = Number(form.price);

    if (!form.name.trim() || !form.category.trim()) {
      setFormError('Please enter a product name and category.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Please enter a valid price greater than zero.');
      return;
    }

    const baseInput = {
      name: form.name.trim(),
      category: form.category.trim(),
      price,
      color: form.color.trim() || '#F5D6BA',
    };

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        ...baseInput,
      });
    } else {
      await addProduct(baseInput);
    }

    closeModal();
  }

  return {
    products,
    isHydrated,
    isModalVisible,
    isEditing: editingProduct !== null,
    form,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    updateField,
    submitForm,
    deleteProduct: (productId: string) => void deleteProductAction(productId),
    reorderProducts,
  };
}
