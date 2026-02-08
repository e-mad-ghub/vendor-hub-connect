import React from 'react';
import type { Product } from '@/types/marketplace';
import { adminSeedProducts } from '@/data/adminCatalog';

const STORAGE_KEY = 'vhc_products';
const STORAGE_BOOTSTRAP_KEY = 'vhc_products_bootstrapped';
const ADMIN_ID = 'admin_local';
const ADMIN_NAME = 'الأدمن';

export type NewProductInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  carBrands?: string[];
  imageDataUrl?: string;
};

const normalizeProducts = (items: Product[]): Product[] =>
  items.map((product) => ({
    ...product,
    ownerId: product.ownerId || ADMIN_ID,
    ownerName: product.ownerName || ADMIN_NAME,
    carBrands: product.carBrands || [],
    imageDataUrl: product.imageDataUrl || '',
  }));

const filterAdminProducts = (items: Product[]): Product[] =>
  items.filter((product) => (product.ownerId || ADMIN_ID) === ADMIN_ID);

const cleanupLegacyProductFields = (items: Product[]): Product[] =>
  items.map(({ imageDataUrl, ...rest }) => ({
    ...rest,
    imageDataUrl: imageDataUrl || '',
  }));

const emitProductsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vhc-products-updated'));
  }
};

export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const alreadyBootstrapped = localStorage.getItem(STORAGE_BOOTSTRAP_KEY) === 'true';
    if (!raw || !alreadyBootstrapped) {
      const seeded = filterAdminProducts(normalizeProducts(adminSeedProducts));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(STORAGE_BOOTSTRAP_KEY, 'true');
      return seeded;
    }

    const parsed = JSON.parse(raw) as Product[];
    return filterAdminProducts(normalizeProducts(cleanupLegacyProductFields(parsed)));
  } catch {
    return [];
  }
};

const saveProducts = (items: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filterAdminProducts(items)));
  emitProductsUpdated();
};

export const addProduct = (input: NewProductInput): Product => {
  const newProduct: Product = {
    id: `p_${Date.now()}`,
    title: input.title,
    description: input.description,
    price: input.price,
    category: input.category,
    ownerId: ADMIN_ID,
    ownerName: ADMIN_NAME,
    createdAt: new Date().toISOString(),
    carBrands: input.carBrands,
    imageDataUrl: input.imageDataUrl || '',
  };
  const current = getProducts();
  const next = [newProduct, ...current];
  saveProducts(next);
  return newProduct;
};

export const removeProduct = (id: string) => {
  const current = getProducts();
  const next = current.filter((product) => product.id !== id);
  saveProducts(next);
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const current = getProducts();
  const next = current.map((product) => {
    if (product.id !== id) return product;
    return {
      ...product,
      ...updates,
      ownerId: ADMIN_ID,
      ownerName: ADMIN_NAME,
      carBrands: updates.carBrands ?? product.carBrands ?? [],
      imageDataUrl: updates.imageDataUrl ?? product.imageDataUrl ?? '',
    };
  });
  saveProducts(next);
  return next.find((product) => product.id === id) || null;
};

export const getProductById = (id: string): Product | undefined =>
  getProducts().find((product) => product.id === id);

export const getProductsByCategory = (category: string): Product[] =>
  getProducts().filter((product) => product.category === category);

export const useProducts = () => {
  const [products, setProducts] = React.useState<Product[]>(() => getProducts());

  const refresh = React.useCallback(() => {
    setProducts(getProducts());
  }, []);

  React.useEffect(() => {
    const handleUpdate = () => refresh();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) handleUpdate();
    };
    window.addEventListener('vhc-products-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('vhc-products-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  const createProduct = React.useCallback((input: NewProductInput) => {
    const created = addProduct(input);
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteProduct = React.useCallback((id: string) => {
    removeProduct(id);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const editProduct = React.useCallback((id: string, updates: Partial<Product>) => {
    const updated = updateProduct(id, updates);
    if (!updated) return null;
    setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
    return updated;
  }, []);

  return { products, createProduct, deleteProduct, editProduct, refresh };
};
