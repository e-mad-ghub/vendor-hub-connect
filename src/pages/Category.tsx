import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { categories } from '@/data/mockData';
import { useProducts } from '@/data/productsStore';
import { ChevronRight } from 'lucide-react';
import { Seo } from '@/components/Seo';

const Category = () => {
  const { name } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name || '');
  const { products } = useProducts();
  const categoryProducts = products.filter(product => product.category === categoryName);
  const category = categories.find(c => c.name === categoryName);

  return (
    <Layout>
      <Seo
        title={`فئة ${categoryName}`}
        description={`تصفح منتجات فئة ${categoryName} في سوق الحرفيين.`}
      />
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
          <p className="text-muted-foreground mt-1">{categoryProducts.length} منتج</p>
        </div>

        {/* Category Chips */}
        <CategoryChips categories={categories} activeCategory={categoryName} />

        {/* Products Grid */}
        <div className="mt-6">
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
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
