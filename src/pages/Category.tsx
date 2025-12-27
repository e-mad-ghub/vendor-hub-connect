import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { categories, getProductsByCategory } from '@/data/mockData';
import { ChevronRight } from 'lucide-react';

const Category = () => {
  const { name } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name || '');
  const products = getProductsByCategory(categoryName);
  const category = categories.find(c => c.name === categoryName);

  return (
    <Layout>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{categoryName}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            {category?.icon} {categoryName}
          </h1>
          <p className="text-muted-foreground mt-1">{products.length} منتج</p>
        </div>

        {/* Category Chips */}
        <CategoryChips categories={categories} activeCategory={categoryName} />

        {/* Subcategories */}
        {category?.subcategories && (
          <div className="flex flex-wrap gap-2 my-4">
            {category.subcategories.map((sub) => (
              <Link
                key={sub}
                to={`/search?category=${categoryName}&subcategory=${sub}`}
                className="px-4 py-2 bg-card rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-sm"
              >
                {sub}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="mt-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">مافيش منتجات في الفئة دي لسه</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Category;
