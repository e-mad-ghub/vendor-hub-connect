import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/marketplace';
import { formatCarBrands } from '@/lib/brands';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasNew = !!product.newAvailable && typeof product.newPrice === 'number';
  const hasImported = !!product.importedAvailable;
  const newPrice = typeof product.newPrice === 'number' ? product.newPrice : 0;
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
            fetchPriority="low"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            width={400}
            height={400}
          />
        ) : (
          'صورة المنتج'
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">جديد</span>
            <span className={`text-sm font-bold ${hasNew ? 'text-primary' : 'text-muted-foreground'}`}>
              {hasNew ? `ج.م ${newPrice.toFixed(2)}` : 'غير متاح'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">استيراد</span>
            <span className={`text-xs font-semibold ${hasImported ? 'text-foreground' : 'text-muted-foreground'}`}>
              {hasImported ? 'متاح' : 'غير متاح'}
            </span>
          </div>
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
