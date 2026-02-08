import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/marketplace';
import { formatCarBrands } from '@/lib/brands';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="product-card block group">
      <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground">
        {product.imageDataUrl ? (
          <img
            src={product.imageDataUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          'صورة المنتج'
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-foreground">ج.م {product.price.toFixed(2)}</span>
        </div>

        <p className="text-xs text-muted-foreground truncate">
          الفئة: {product.category}
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          الماركات: {formatCarBrands(product.carBrands)}
        </p>
      </div>
    </Link>
  );
};
