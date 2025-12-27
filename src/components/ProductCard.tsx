import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/marketplace';
import { RatingStars } from './RatingStars';
import { getVendorById } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const vendor = getVendorById(product.vendorId);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.id}`} className="product-card block group">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {discount && (
          <Badge className="absolute top-2 left-2 deal-badge text-primary-foreground text-xs font-semibold">
            -{discount}%
          </Badge>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-1 mb-1.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-foreground">ج.م {product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">ج.م {product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        {vendor && (
          <p className="text-xs text-muted-foreground truncate">
            من {vendor.storeName}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {product.sold.toLocaleString()}+ مبيعات
        </p>
      </div>
    </Link>
  );
};
