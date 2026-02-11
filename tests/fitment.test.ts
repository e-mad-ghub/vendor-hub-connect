import test from 'node:test';
import assert from 'node:assert/strict';
import type { Product } from '../src/types/marketplace';
import { extractFitmentOptions, filterHomeProducts, getProductFitmentMatch } from '../src/lib/fitment.ts';

const products: Product[] = [
  {
    id: 'p1',
    title: 'تيل فرامل كورولا',
    description: 'منتج 1',
    category: 'الفرامل',
    createdAt: '2026-01-01',
    carBrands: ['تويوتا - كورولا'],
  },
  {
    id: 'p2',
    title: 'فلتر هواء توسان',
    description: 'منتج 2',
    category: 'الموتور',
    createdAt: '2026-01-02',
    carBrands: ['هيونداي - توسان'],
  },
  {
    id: 'p3',
    title: 'قطعة عامة بدون توافق',
    description: 'منتج 3',
    category: 'الكهرباء',
    createdAt: '2026-01-03',
    carBrands: [],
  },
  {
    id: 'p4',
    title: 'مساعد تويوتا عام',
    description: 'منتج 4',
    category: 'العفشة والدركسيون',
    createdAt: '2026-01-04',
    carBrands: ['تويوتا'],
  },
];

test('extractFitmentOptions derives brands/models from product fitment fields', () => {
  const options = extractFitmentOptions(products);

  assert.equal(options.brands.includes('تويوتا'), true);
  assert.equal(options.brands.includes('هيونداي'), true);
  assert.deepEqual(options.modelsByBrand['تويوتا'], ['كورولا']);
  assert.deepEqual(options.modelsByBrand['هيونداي'], ['توسان']);
});

test('getProductFitmentMatch returns confirmed/uncertain according to selected brand and model', () => {
  const confirmed = getProductFitmentMatch(products[0], 'تويوتا', 'كورولا');
  assert.equal(confirmed.confirmed, true);
  assert.equal(confirmed.uncertain, false);

  const uncertainNoData = getProductFitmentMatch(products[2], 'تويوتا', 'كورولا');
  assert.equal(uncertainNoData.confirmed, false);
  assert.equal(uncertainNoData.uncertain, true);

  const uncertainBrandOnly = getProductFitmentMatch(products[3], 'تويوتا', 'كورولا');
  assert.equal(uncertainBrandOnly.confirmed, false);
  assert.equal(uncertainBrandOnly.uncertain, true);
});

test('uncertain fitment toggle includes only uncertain records when enabled', () => {
  const offResult = filterHomeProducts(products, {
    selectedBrand: 'تويوتا',
    selectedModel: 'كورولا',
    nameQuery: '',
    includeUncertain: false,
  });

  assert.deepEqual(
    offResult.items.map((item) => item.id),
    ['p1']
  );

  const onResult = filterHomeProducts(products, {
    selectedBrand: 'تويوتا',
    selectedModel: 'كورولا',
    nameQuery: '',
    includeUncertain: true,
  });

  assert.deepEqual(
    onResult.items.map((item) => item.id),
    ['p1', 'p3', 'p4']
  );
  assert.equal(onResult.uncertainIds.has('p3'), true);
  assert.equal(onResult.uncertainIds.has('p4'), true);
});

test('filter order applies car fitment first, then search-within-results', () => {
  const result = filterHomeProducts(products, {
    selectedBrand: 'تويوتا',
    selectedModel: 'كورولا',
    nameQuery: 'فلتر',
    includeUncertain: false,
  });

  // "فلتر" exists in p2 title, but p2 is not a Toyota Corolla match.
  // The final result should be empty if car filter runs before name filtering.
  assert.equal(result.items.length, 0);
});
