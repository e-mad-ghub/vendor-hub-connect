import React from 'react';
import type { Product } from '@/types/marketplace';
import { adminSeedProducts } from '@/data/adminCatalog';
import { translateBrandLabel, expandBrandsWithModels, BRAND_OPTIONS_KEY, defaultBrandOptions, translateBrandOptions, type BrandOption } from '@/data/brandOptions';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';

const STORAGE_KEY = 'vhc_products';
const ADMIN_ID = 'admin_local';
const ADMIN_NAME = 'الأدمن';

export type NewProductInput = {
  title: string;
  description: string;
  newAvailable: boolean;
  newPrice?: number;
  importedAvailable: boolean;
  category: string;
  carBrands?: string[];
  imageDataUrl?: string;
};

const normalizeProducts = (items: Product[]): Product[] =>
  items.map((product) => {
    const legacyPrice = (product as Product & { price?: number }).price;
    const derivedNewPrice = product.newPrice ?? (typeof legacyPrice === 'number' ? legacyPrice : 1000);
    const derivedNewAvailable = true;
    const derivedImportedAvailable = true;

    return {
      ...product,
      newAvailable: derivedNewAvailable,
      newPrice: derivedNewPrice,
      importedAvailable: derivedImportedAvailable,
      ownerId: product.ownerId || ADMIN_ID,
      ownerName: product.ownerName || ADMIN_NAME,
      carBrands: product.carBrands || [],
      imageDataUrl: product.imageDataUrl || '',
    };
  });

const filterAdminProducts = (items: Product[]): Product[] =>
  items.filter((product) => (product.ownerId || ADMIN_ID) === ADMIN_ID);

const cleanupLegacyProductFields = (items: Product[]): Product[] =>
  items.map(({ imageDataUrl, ...rest }) => ({
    ...rest,
    imageDataUrl: imageDataUrl || '',
  }));

const translateProductBrands = (items: Product[]): { items: Product[]; changed: boolean } => {
  let changed = false;
  const next = items.map((product) => {
    if (!product.carBrands || product.carBrands.length === 0) return product;
    const translated = product.carBrands.map((value) => translateBrandLabel(value));
    const same = translated.every((value, index) => value === product.carBrands?.[index]);
    if (!same) {
      changed = true;
      return { ...product, carBrands: translated };
    }
    return product;
  });
  return { items: next, changed };
};

const emitProductsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vhc-products-updated'));
  }
};

const readLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
};

const writeLocalProducts = (items: Product[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

let cachedProducts: Product[] = [];

const ensureInitialProducts = () => {
  if (cachedProducts.length > 0) return;
  const local = readLocalProducts();
  if (local.length > 0) {
    cachedProducts = filterAdminProducts(normalizeProducts(cleanupLegacyProductFields(local)));
    return;
  }
  const seeded = filterAdminProducts(normalizeProducts(adminSeedProducts));
  cachedProducts = seeded;
  writeLocalProducts(seeded);
};

const loadBrandOptions = (): BrandOption[] => {
  try {
    const raw = localStorage.getItem(BRAND_OPTIONS_KEY);
    if (!raw) return defaultBrandOptions;
    const parsed = JSON.parse(raw) as BrandOption[];
    return translateBrandOptions(parsed);
  } catch {
    return defaultBrandOptions;
  }
};

const prepareProducts = (items: Product[], brandOptions: BrandOption[]): Product[] => {
  const normalized = filterAdminProducts(normalizeProducts(cleanupLegacyProductFields(items)));
  const translated = translateProductBrands(normalized);
  const expanded = translated.items.map((product) => ({
    ...product,
    carBrands: expandBrandsWithModels(product.carBrands, brandOptions),
  }));
  return expanded;
};

const setCachedProducts = (items: Product[]) => {
  cachedProducts = filterAdminProducts(items);
  writeLocalProducts(cachedProducts);
  emitProductsUpdated();
};

const fetchProductsFromDb = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('app_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = data || [];
  const mapped: Product[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    newAvailable: row.new_available,
    newPrice: typeof row.new_price === 'number' ? row.new_price : undefined,
    importedAvailable: row.imported_available,
    category: row.category || 'غير محدد',
    carBrands: Array.isArray(row.car_brands) ? (row.car_brands as string[]) : [],
    imageDataUrl: row.image_data_url || '',
    ownerId: row.owner_id || ADMIN_ID,
    ownerName: row.owner_name || ADMIN_NAME,
    createdAt: row.created_at,
  }));

  return mapped;
};

export const getProducts = (): Product[] => {
  ensureInitialProducts();
  return cachedProducts;
};

export const addProduct = async (input: NewProductInput): Promise<Product> => {
  const newProduct: Product = {
    id: `p_${Date.now()}`,
    title: input.title,
    description: input.description,
    newAvailable: input.newAvailable,
    newPrice: input.newAvailable ? input.newPrice : undefined,
    importedAvailable: input.importedAvailable,
    category: input.category,
    ownerId: ADMIN_ID,
    ownerName: ADMIN_NAME,
    createdAt: new Date().toISOString(),
    carBrands: input.carBrands,
    imageDataUrl: input.imageDataUrl || '',
  };

  const { error } = await supabase
    .from('app_products')
    .insert({
      id: newProduct.id,
      title: newProduct.title,
      description: newProduct.description,
      new_available: !!newProduct.newAvailable,
      new_price: newProduct.newAvailable ? (newProduct.newPrice || 0) : null,
      imported_available: !!newProduct.importedAvailable,
      category: newProduct.category,
      car_brands: newProduct.carBrands || [],
      image_data_url: newProduct.imageDataUrl || '',
      owner_id: newProduct.ownerId || ADMIN_ID,
      owner_name: newProduct.ownerName || ADMIN_NAME,
      created_at: newProduct.createdAt,
    });

  if (error) throw error;

  const next = [newProduct, ...getProducts()];
  setCachedProducts(next);
  return newProduct;
};

export const removeProduct = async (id: string) => {
  const { error } = await supabase
    .from('app_products')
    .delete()
    .eq('id', id);
  if (error) throw error;

  const current = getProducts();
  const next = current.filter((product) => product.id !== id);
  setCachedProducts(next);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const current = getProducts();
  const currentProduct = current.find((product) => product.id === id);
  if (!currentProduct) return null;

  const nextNewAvailable =
    typeof updates.newAvailable === 'boolean' ? updates.newAvailable : currentProduct.newAvailable;
  const nextNewPrice =
    typeof updates.newPrice === 'number' ? updates.newPrice : currentProduct.newPrice;

  const { error } = await supabase
    .from('app_products')
    .update({
      title: updates.title ?? currentProduct.title,
      description: updates.description ?? currentProduct.description,
      new_available: !!nextNewAvailable,
      new_price: nextNewAvailable ? (nextNewPrice || 0) : null,
      imported_available:
        typeof updates.importedAvailable === 'boolean'
          ? updates.importedAvailable
          : currentProduct.importedAvailable,
      category: updates.category ?? currentProduct.category,
      car_brands: updates.carBrands ?? currentProduct.carBrands ?? [],
      image_data_url: updates.imageDataUrl ?? currentProduct.imageDataUrl ?? '',
      owner_id: updates.ownerId ?? currentProduct.ownerId ?? ADMIN_ID,
      owner_name: updates.ownerName ?? currentProduct.ownerName ?? ADMIN_NAME,
    })
    .eq('id', id);

  if (error) throw error;

  const next = current.map((product) => {
    if (product.id !== id) return product;
    return {
      ...product,
      ...updates,
      newAvailable: nextNewAvailable,
      newPrice: nextNewAvailable ? nextNewPrice : undefined,
      ownerId: ADMIN_ID,
      ownerName: ADMIN_NAME,
      carBrands: updates.carBrands ?? product.carBrands ?? [],
      imageDataUrl: updates.imageDataUrl ?? product.imageDataUrl ?? '',
    };
  });
  setCachedProducts(next);
  return next.find((product) => product.id === id) || null;
};

export const getProductById = (id: string): Product | undefined =>
  getProducts().find((product) => product.id === id);

export const getProductsByCategory = (category: string): Product[] =>
  getProducts().filter((product) => product.category === category);

export const useProducts = () => {
  const [products, setProducts] = React.useState<Product[]>(() => getProducts());
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const [dbProducts, dbBrandOptions] = await Promise.all([
        fetchProductsFromDb(),
        api.getBrandOptions().catch(() => loadBrandOptions()),
      ]);
      if (dbProducts.length > 0) {
        const prepared = prepareProducts(dbProducts, dbBrandOptions || loadBrandOptions());
        setCachedProducts(prepared);
      }
    } catch {
      // Keep local cache if remote fails.
    } finally {
      setProducts(getProducts());
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handleUpdate = () => setProducts(getProducts());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) handleUpdate();
    };
    refresh();
    window.addEventListener('vhc-products-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('vhc-products-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  const createProduct = React.useCallback(async (input: NewProductInput) => {
    const created = await addProduct(input);
    setProducts(getProducts());
    return created;
  }, []);

  const deleteProduct = React.useCallback(async (id: string) => {
    await removeProduct(id);
    setProducts(getProducts());
  }, []);

  const editProduct = React.useCallback(async (id: string, updates: Partial<Product>) => {
    const updated = await updateProduct(id, updates);
    if (!updated) return null;
    setProducts(getProducts());
    return updated;
  }, []);

  return { products, createProduct, deleteProduct, editProduct, refresh, isLoading };
};
