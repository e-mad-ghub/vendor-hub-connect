export type SavedSearch = {
  id: string;
  brand: string;
  model: string;
  q: string;
  createdAt: string;
};

const RECENT_VIEWS_KEY = 'vhc_recent_viewed_product_ids';
const RECENT_QUERIES_KEY = 'vhc_recent_part_queries';
const SAVED_SEARCHES_KEY = 'vhc_saved_searches';

const MAX_RECENT_VIEWS = 8;
const MAX_RECENT_QUERIES = 8;
const MAX_SAVED_SEARCHES = 12;

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures.
  }
};

export const getRecentViewedProductIds = (): string[] =>
  readJson<string[]>(RECENT_VIEWS_KEY, []).filter(Boolean);

export const pushRecentViewedProduct = (productId: string) => {
  if (!productId) return;

  const current = getRecentViewedProductIds().filter((id) => id !== productId);
  current.unshift(productId);
  writeJson(RECENT_VIEWS_KEY, current.slice(0, MAX_RECENT_VIEWS));
};

export const getRecentPartQueries = (): string[] =>
  readJson<string[]>(RECENT_QUERIES_KEY, []).filter(Boolean);

export const pushRecentPartQuery = (query: string) => {
  const normalized = query.trim();
  if (!normalized) return;

  const current = getRecentPartQueries().filter((item) => item !== normalized);
  current.unshift(normalized);
  writeJson(RECENT_QUERIES_KEY, current.slice(0, MAX_RECENT_QUERIES));
};

export const getSavedSearches = (): SavedSearch[] =>
  readJson<SavedSearch[]>(SAVED_SEARCHES_KEY, []).filter((item) => !!item.id);

export const saveSearch = (input: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch | null => {
  if (!input.brand && !input.model && !input.q.trim()) return null;

  const current = getSavedSearches();

  const duplicate = current.find(
    (item) =>
      item.brand === input.brand &&
      item.model === input.model &&
      item.q.trim().toLowerCase() === input.q.trim().toLowerCase()
  );

  if (duplicate) {
    return duplicate;
  }

  const next: SavedSearch = {
    id: `saved_${Date.now()}`,
    brand: input.brand,
    model: input.model,
    q: input.q.trim(),
    createdAt: new Date().toISOString(),
  };

  current.unshift(next);
  writeJson(SAVED_SEARCHES_KEY, current.slice(0, MAX_SAVED_SEARCHES));
  return next;
};
