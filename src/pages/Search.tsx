import React, { useState, useMemo } from 'react';
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
import { products, categories, vendors } from '@/data/mockData';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Rating filter
    if (selectedRating) {
      result = result.filter(p => p.rating >= selectedRating);
    }

    // Vendor filter
    if (selectedVendors.length > 0) {
      result = result.filter(p => selectedVendors.includes(p.vendorId));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'bestselling':
        result.sort((a, b) => b.sold - a.sold);
        break;
    }

    return result;
  }, [query, priceRange, selectedCategories, selectedRating, selectedVendors, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(v => v !== vendorId)
        : [...prev, vendorId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedRating(null);
    setSelectedVendors([]);
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 500 || selectedCategories.length > 0 || selectedRating || selectedVendors.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={500}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
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

      {/* Rating */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedRating === rating}
                onCheckedChange={() => setSelectedRating(selectedRating === rating ? null : rating)}
              />
              <span className="text-sm flex items-center gap-1">
                {'⭐'.repeat(rating)} & up
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Vendors */}
      <div>
        <h4 className="font-medium mb-3">Vendors</h4>
        <div className="space-y-2">
          {vendors.filter(v => v.status === 'approved').map((vendor) => (
            <label key={vendor.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedVendors.includes(vendor.id)}
                onCheckedChange={() => toggleVendor(vendor.id)}
              />
              <span className="text-sm">{vendor.storeName}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          {query ? (
            <h1 className="text-xl font-semibold">
              Results for "{query}" <span className="text-muted-foreground font-normal">({filteredProducts.length} items)</span>
            </h1>
          ) : (
            <h1 className="text-xl font-semibold">
              All Products <span className="text-muted-foreground font-normal">({filteredProducts.length} items)</span>
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
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="bestselling">Best Selling</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-lg p-4 shadow-card">
              <h3 className="font-semibold mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
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
