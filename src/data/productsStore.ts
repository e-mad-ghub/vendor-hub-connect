import React from 'react';
import type { Product } from '@/types/marketplace';
import {
  expandBrandsWithModels,
  defaultBrandOptions,
  type BrandOption,
} from '@/data/brandOptions';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';

const ADMIN_ID = 'admin_local';
const ADMIN_NAME = 'الأدمن';
const MAX_IMAGE_DATA_URL_LENGTH = 2_000_000;
const PRODUCT_IMAGES_BUCKET = import.meta.env.VITE_PRODUCT_IMAGES_BUCKET || 'product-images';

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

const normalizeImageDataUrl = (value: string | undefined): string => {
  if (!value) return '';
  if (!value.startsWith('data:image/')) return value;
  if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error('الصورة كبيرة جدًا. اختر صورة أصغر.');
  }
  return value;
};

const normalizeFetchedImageUrl = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  let next = value.trim();
  if (!next) return '';

  if ((next.startsWith('"') && next.endsWith('"')) || (next.startsWith("'") && next.endsWith("'"))) {
    next = next.slice(1, -1).trim();
  }

  if (next.startsWith('data:image/') || next.startsWith('http://') || next.startsWith('https://') || next.startsWith('/')) {
    return next;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      return normalizeFetchedImageUrl(parsed);
    }
  } catch {
    // Keep empty fallback for non-URL malformed values.
  }

  return '';
};

const emitProductsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vhc-products-updated'));
  }
};

const getStoragePathFromPublicUrl = (value: string): string | null => {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const encodedPath = parsed.pathname.slice(markerIndex + marker.length);
    const decodedPath = decodeURIComponent(encodedPath).trim();
    return decodedPath || null;
  } catch {
    return null;
  }
};

const deleteProductImageObject = async (imageUrl: string) => {
  const objectPath = getStoragePathFromPublicUrl(imageUrl);
  if (!objectPath) return;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([objectPath]);

  if (error) {
    // Keep product CRUD successful even if image cleanup fails.
    console.error('Failed to cleanup product image object:', error.message);
  }
};

let cachedProducts: Product[] = [];

const normalizeProduct = (product: Product): Product => {
  const legacyPrice = (product as Product & { price?: number }).price;
  const newAvailable = typeof product.newAvailable === 'boolean' ? product.newAvailable : true;
  const importedAvailable =
    typeof product.importedAvailable === 'boolean' ? product.importedAvailable : false;

  return {
    ...product,
    description: product.description || '',
    newAvailable,
    importedAvailable,
    newPrice:
      newAvailable
        ? (typeof product.newPrice === 'number' ? product.newPrice : legacyPrice)
        : undefined,
    category: product.category || 'غير محدد',
    ownerId: product.ownerId || ADMIN_ID,
    ownerName: product.ownerName || ADMIN_NAME,
    carBrands: product.carBrands || [],
    imageDataUrl: product.imageDataUrl || '',
  };
};

const prepareProducts = (items: Product[], brandOptions: BrandOption[]): Product[] =>
  items.map((product) => {
    const normalized = normalizeProduct(product);
    return {
      ...normalized,
      carBrands: expandBrandsWithModels(normalized.carBrands, brandOptions),
    };
  });

const setCachedProducts = (items: Product[]) => {
  cachedProducts = items;
  emitProductsUpdated();
};

const parseNullableNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const fetchProductsFromDb = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('app_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = data || [];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    newAvailable: !!row.new_available,
    newPrice: parseNullableNumber(row.new_price),
    importedAvailable: !!row.imported_available,
    category: row.category || 'غير محدد',
    carBrands: Array.isArray(row.car_brands) ? (row.car_brands as string[]) : [],
    imageDataUrl: normalizeFetchedImageUrl(row.image_data_url),
    ownerId: row.owner_id || ADMIN_ID,
    ownerName: row.owner_name || ADMIN_NAME,
    createdAt: row.created_at,
  }));
};

const loadDbBackedProducts = async (): Promise<Product[]> => {
  const [dbProducts, dbBrandOptions] = await Promise.all([
    fetchProductsFromDb(),
    api.getBrandOptions().catch(() => defaultBrandOptions),
  ]);

  const prepared = prepareProducts(dbProducts, dbBrandOptions || defaultBrandOptions);
  setCachedProducts(prepared);
  return prepared;
};

export const getProducts = (): Product[] => cachedProducts;

export const addProduct = async (input: NewProductInput): Promise<Product> => {
  const normalizedImageDataUrl = normalizeImageDataUrl(input.imageDataUrl);
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('app_products')
    .insert({
      id,
      title: input.title,
      description: input.description,
      new_available: !!input.newAvailable,
      new_price: input.newAvailable ? (input.newPrice || 0) : null,
      imported_available: !!input.importedAvailable,
      category: input.category || 'غير محدد',
      car_brands: input.carBrands || [],
      image_data_url: normalizedImageDataUrl,
      owner_id: ADMIN_ID,
      owner_name: ADMIN_NAME,
      created_at: nowIso,
    });

  if (error) throw error;

  const latest = await loadDbBackedProducts();
  return latest.find((product) => product.id === id) || normalizeProduct({
    id,
    title: input.title,
    description: input.description,
    newAvailable: input.newAvailable,
    newPrice: input.newAvailable ? input.newPrice : undefined,
    importedAvailable: input.importedAvailable,
    category: input.category || 'غير محدد',
    carBrands: input.carBrands || [],
    imageDataUrl: normalizedImageDataUrl,
    ownerId: ADMIN_ID,
    ownerName: ADMIN_NAME,
    createdAt: nowIso,
  });
};

export const removeProduct = async (id: string) => {
  const current = cachedProducts.find((product) => product.id === id);
  const { error } = await supabase
    .from('app_products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  await loadDbBackedProducts();
  if (current?.imageDataUrl) {
    await deleteProductImageObject(current.imageDataUrl);
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const hasImageUpdate = Object.prototype.hasOwnProperty.call(updates, 'imageDataUrl');
  const normalizedImageDataUrl = hasImageUpdate
    ? normalizeImageDataUrl(updates.imageDataUrl)
    : undefined;
  const current = cachedProducts.find((product) => product.id === id);
  const currentNewAvailable = current?.newAvailable ?? false;
  const nextNewAvailable =
    typeof updates.newAvailable === 'boolean' ? updates.newAvailable : currentNewAvailable;

  const updatePayload = {
    title: updates.title ?? current?.title,
    description: updates.description ?? current?.description ?? '',
    new_available: nextNewAvailable,
    new_price: nextNewAvailable ? (updates.newPrice ?? current?.newPrice ?? 0) : null,
    imported_available: updates.importedAvailable ?? current?.importedAvailable ?? false,
    category: updates.category ?? current?.category ?? 'غير محدد',
    car_brands: updates.carBrands ?? current?.carBrands ?? [],
    image_data_url: hasImageUpdate ? (normalizedImageDataUrl || '') : (current?.imageDataUrl || ''),
    owner_id: updates.ownerId ?? current?.ownerId ?? ADMIN_ID,
    owner_name: updates.ownerName ?? current?.ownerName ?? ADMIN_NAME,
  };

  const { error } = await supabase
    .from('app_products')
    .update(updatePayload)
    .eq('id', id);

  if (error) throw error;

  const latest = await loadDbBackedProducts();
  const hasImageChanged = hasImageUpdate && normalizedImageDataUrl !== (current?.imageDataUrl || '');
  if (hasImageChanged && current?.imageDataUrl) {
    await deleteProductImageObject(current.imageDataUrl);
  }
  return latest.find((product) => product.id === id) || null;
};

export const getProductById = (id: string): Product | undefined =>
  cachedProducts.find((product) => product.id === id);

export const getProductsByCategory = (category: string): Product[] =>
  cachedProducts.filter((product) => product.category === category);

export const useProducts = () => {
  const [products, setProducts] = React.useState<Product[]>(() => getProducts());
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const refreshInFlightRef = React.useRef(false);

  const refresh = React.useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    try {
      setError(null);
      await loadDbBackedProducts();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'تعذر تحميل المنتجات.';
      setError(message);
    } finally {
      refreshInFlightRef.current = false;
      setProducts(getProducts());
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handleUpdate = () => setProducts(getProducts());
    refresh();
    window.addEventListener('vhc-products-updated', handleUpdate);
    return () => {
      window.removeEventListener('vhc-products-updated', handleUpdate);
    };
  }, [refresh]);

  React.useEffect(() => {
    // Keep trying continuously; retry faster while there is an error.
    const intervalMs = error ? 5000 : 30000;
    const interval = window.setInterval(() => {
      refresh();
    }, intervalMs);

    const onFocus = () => refresh();
    const onOnline = () => refresh();

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [error, refresh]);

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

  return { products, createProduct, deleteProduct, editProduct, refresh, isLoading, error };
};
