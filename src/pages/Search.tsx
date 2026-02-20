import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, X } from 'lucide-react';
import { categories } from '@/data/mockData';
import { useProducts } from '@/data/productsStore';
import { Seo } from '@/components/Seo';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';

const SORT_VALUES = ['relevance', 'newest', 'price-low', 'price-high'] as const;
type SortValue = (typeof SORT_VALUES)[number];

const isSortValue = (value: string | null): value is SortValue =>
  !!value && SORT_VALUES.includes(value as SortValue);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort');
  const initialSort: SortValue = isSortValue(sortParam) ? sortParam : 'relevance';
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortValue>(initialSort);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPriceRangeDirty, setIsPriceRangeDirty] = useState(false);

  const { products, isLoading: productsLoading, error: productsError, refresh: refreshProducts } = useProducts();

  useEffect(() => {
    const nextSort = isSortValue(searchParams.get('sort')) ? (searchParams.get('sort') as SortValue) : 'relevance';
    setSortBy((prev) => (prev === nextSort ? prev : nextSort));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (sortBy === 'relevance') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', sortBy);
    }

    const currentString = searchParams.toString();
    const nextString = nextParams.toString();
    if (currentString !== nextString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [sortBy, searchParams, setSearchParams]);

  const maxPrice = useMemo(() => {
    const highest = products.reduce((acc, product) => {
      if (product.newAvailable && typeof product.newPrice === 'number') {
        return Math.max(acc, product.newPrice);
      }
      return acc;
    }, 0);

    if (highest <= 500) return 500;
    return Math.ceil(highest / 100) * 100;
  }, [products]);

  useEffect(() => {
    setPriceRange((prev) => {
      if (!isPriceRangeDirty) {
        return [0, maxPrice];
      }

      const nextMin = Math.max(0, Math.min(prev[0], maxPrice));
      const nextMax = Math.max(nextMin, Math.min(prev[1], maxPrice));
      if (nextMin === prev[0] && nextMax === prev[1]) return prev;
      return [nextMin, nextMax];
    });
  }, [maxPrice, isPriceRangeDirty]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Price filter (based on new price when available)
    result = result.filter(p => {
      const priceValue = p.newAvailable && typeof p.newPrice === 'number' ? p.newPrice : 0;
      return priceValue >= priceRange[0] && priceValue <= priceRange[1];
    });

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => (p.carBrands || []).some(brand => selectedBrands.includes(brand)));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const aPrice = a.newAvailable && typeof a.newPrice === 'number' ? a.newPrice : 0;
          const bPrice = b.newAvailable && typeof b.newPrice === 'number' ? b.newPrice : 0;
          return aPrice - bPrice;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const aPrice = a.newAvailable && typeof a.newPrice === 'number' ? a.newPrice : 0;
          const bPrice = b.newAvailable && typeof b.newPrice === 'number' ? b.newPrice : 0;
          return bPrice - aPrice;
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, query, priceRange, selectedCategories, selectedBrands, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setIsPriceRangeDirty(false);
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  const formatEgp = (value: number) => `ج.م ${Math.round(value).toLocaleString('en-US')}`;

  const applyPriceRange = (nextRange: [number, number]) => {
    setPriceRange(nextRange);
    setIsPriceRangeDirty(!(nextRange[0] === 0 && nextRange[1] === maxPrice));
  };

  const quickPriceRanges: Array<{ key: string; label: string; range: [number, number] }> = [
    { key: 'all', label: 'الكل', range: [0, maxPrice] },
    { key: 'budget', label: 'اقتصادي', range: [0, Math.max(100, Math.round((maxPrice * 0.3) / 10) * 10)] },
    {
      key: 'mid',
      label: 'متوسط',
      range: [
        Math.round((maxPrice * 0.3) / 10) * 10,
        Math.round((maxPrice * 0.7) / 10) * 10,
      ],
    },
    {
      key: 'high',
      label: 'أعلى سعر',
      range: [Math.round((maxPrice * 0.7) / 10) * 10, maxPrice],
    },
  ];

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < maxPrice || selectedCategories.length > 0 || selectedBrands.length > 0;

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      (product.carBrands || []).forEach((brand) => set.add(brand));
    });
    return Array.from(set);
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      {/* Price Range */}
      <div className="w-full rounded-xl border border-border bg-muted/40 p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium">نطاق السعر</h4>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => applyPriceRange([0, maxPrice])}
            disabled={!isPriceRangeDirty}
          >
            إعادة ضبط
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2" dir="ltr">
          <div className="rounded-lg bg-background border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">من</p>
            <p className="text-sm font-semibold">{formatEgp(priceRange[0])}</p>
          </div>
          <div className="rounded-lg bg-background border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">إلى</p>
            <p className="text-sm font-semibold">{formatEgp(priceRange[1])}</p>
          </div>
        </div>

        <div dir="ltr">
          <Slider
            value={priceRange}
            onValueChange={(value) => {
              setIsPriceRangeDirty(true);
              setPriceRange(value as [number, number]);
            }}
            min={0}
            max={maxPrice}
            step={10}
            className="py-1"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {quickPriceRanges.map((preset) => {
            const isActive = priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
            return (
              <Button
                key={preset.key}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                className="h-7 px-2 text-xs"
                onClick={() => applyPriceRange(preset.range)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">الفئات</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <span className="text-sm">{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Car Brands */}
      {allBrands.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">ماركات السيارات</h4>
          <div className="space-y-2">
            {allBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full max-w-xs mx-auto block">
          <X className="h-4 w-4 mr-2" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <Seo
        title={query ? `نتائج البحث عن ${query}` : 'كل المنتجات'}
        description="تصفح كل المنتجات وفلتر حسب السعر والفئة والماركة."
      />
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          {query ? (
            <h1 className="text-xl font-semibold">
              النتايج لـ "{query}" <span className="text-muted-foreground font-normal">({filteredProducts.length} منتج)</span>
            </h1>
          ) : (
            <h1 className="text-xl font-semibold">
              كل المنتجات <span className="text-muted-foreground font-normal">({filteredProducts.length} منتج)</span>
            </h1>
          )}
        </div>

        {/* Category Chips */}
        <CategoryChips categories={categories} />

        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between gap-4 my-4">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                الفلاتر
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw] h-[100dvh] max-h-[100dvh] p-0 overflow-y-auto overscroll-contain">
              <SheetHeader className="px-6 pt-6 sticky top-0 bg-background z-10">
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="px-6 pt-6 pb-[max(6rem,env(safe-area-inset-bottom))]">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              إعادة ضبط الفلاتر
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">ترتيب حسب:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">الأكثر صلة</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-lg p-4 shadow-card">
              <h3 className="font-semibold mb-4">الفلاتر</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <LoadingState title="جاري تحميل المنتجات" message="برجاء الانتظار..." />
            ) : productsError ? (
              <InlineError
                title="تعذر تحميل المنتجات"
                message={productsError}
                onRetry={refreshProducts}
              />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">مافيش منتجات مطابقة</p>
                <Button variant="outline" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
