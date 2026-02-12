import type { Product } from '../types/marketplace';

export type FitmentOptions = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
};

export type FitmentMatch = {
  confirmed: boolean;
  uncertain: boolean;
};

export type HomeFilterInput = {
  selectedBrand: string;
  selectedModel: string;
  nameQuery: string;
  includeUncertain: boolean;
};

export type HomeFilterResult = {
  items: Product[];
  uncertainIds: Set<string>;
};

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const normalizeArabic = (value: string): string => {
  return value
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, '')
    .replace(/\u0622|\u0623|\u0625/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .trim();
};

const splitBrandModel = (raw: string): { brand: string; model: string | null } => {
  const value = raw.trim();
  if (!value) return { brand: '', model: null };

  const parts = value.split(' - ');
  if (parts.length >= 2) {
    return {
      brand: parts[0].trim(),
      model: parts.slice(1).join(' - ').trim() || null,
    };
  }

  return { brand: value, model: null };
};

const buildProductFitmentMap = (product: Product): {
  brands: Set<string>;
  modelsByBrand: Map<string, Set<string>>;
} => {
  // Fitment source assumption:
  // `product.carBrands` contains entries in either:
  // - "Brand"
  // - "Brand - Model"
  const brands = new Set<string>();
  const modelsByBrand = new Map<string, Set<string>>();

  (product.carBrands || []).forEach((entry) => {
    const { brand, model } = splitBrandModel(entry);
    if (!brand) return;

    brands.add(brand);
    if (model) {
      if (!modelsByBrand.has(brand)) {
        modelsByBrand.set(brand, new Set<string>());
      }
      modelsByBrand.get(brand)?.add(model);
    }
  });

  return { brands, modelsByBrand };
};

export const extractFitmentOptions = (products: Product[]): FitmentOptions => {
  const brands = new Set<string>();
  const modelsByBrand = new Map<string, Set<string>>();

  products.forEach((product) => {
    (product.carBrands || []).forEach((entry) => {
      const { brand, model } = splitBrandModel(entry);
      if (!brand) return;

      brands.add(brand);

      if (!modelsByBrand.has(brand)) {
        modelsByBrand.set(brand, new Set<string>());
      }

      if (model) {
        modelsByBrand.get(brand)?.add(model);
      }
    });
  });

  const sortedBrands = Array.from(brands).sort((a, b) => a.localeCompare(b, 'ar'));
  const normalizedModelsByBrand: Record<string, string[]> = {};

  sortedBrands.forEach((brand) => {
    normalizedModelsByBrand[brand] = Array.from(modelsByBrand.get(brand) || []).sort((a, b) =>
      a.localeCompare(b, 'ar')
    );
  });

  return {
    brands: sortedBrands,
    modelsByBrand: normalizedModelsByBrand,
  };
};

export const getProductFitmentMatch = (
  product: Product,
  selectedBrand: string,
  selectedModel: string
): FitmentMatch => {
  if (!selectedBrand) return { confirmed: true, uncertain: false };

  const { brands, modelsByBrand } = buildProductFitmentMap(product);
  const hasFitmentData = brands.size > 0;

  if (!hasFitmentData) {
    return { confirmed: false, uncertain: true };
  }

  const hasSelectedBrand = brands.has(selectedBrand) || (modelsByBrand.get(selectedBrand)?.size || 0) > 0;

  if (!hasSelectedBrand) {
    return { confirmed: false, uncertain: false };
  }

  if (!selectedModel) {
    return { confirmed: true, uncertain: false };
  }

  const modelMatches = modelsByBrand.get(selectedBrand)?.has(selectedModel) || false;
  if (modelMatches) {
    return { confirmed: true, uncertain: false };
  }

  return { confirmed: false, uncertain: true };
};

export const filterHomeProducts = (products: Product[], input: HomeFilterInput): HomeFilterResult => {
  const { selectedBrand, selectedModel, nameQuery, includeUncertain } = input;

  const fitmentFiltered: Product[] = [];
  const uncertainIds = new Set<string>();

  products.forEach((product) => {
    const fitment = getProductFitmentMatch(product, selectedBrand, selectedModel);

    if (fitment.confirmed) {
      fitmentFiltered.push(product);
      return;
    }

    if (selectedBrand && includeUncertain && fitment.uncertain) {
      fitmentFiltered.push(product);
      uncertainIds.add(product.id);
    }
  });

  // Home currently has no extra local filters; keeping this stage explicit to preserve filter order.
  const afterExistingFilters = fitmentFiltered;

  const normalizedQuery = normalizeArabic(nameQuery);
  if (!normalizedQuery) {
    return { items: afterExistingFilters, uncertainIds };
  }

  const items = afterExistingFilters.filter((product) =>
    normalizeArabic(product.title).includes(normalizedQuery)
  );

  const nextUncertainIds = new Set<string>();
  items.forEach((item) => {
    if (uncertainIds.has(item.id)) {
      nextUncertainIds.add(item.id);
    }
  });

  return { items, uncertainIds: nextUncertainIds };
};
