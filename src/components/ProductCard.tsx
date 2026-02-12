import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/marketplace';
import { formatCarBrands } from '@/lib/brands';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const hasNew = !!product.newAvailable && typeof product.newPrice === 'number';
  const hasImported = !!product.importedAvailable;
  const newPrice = typeof product.newPrice === 'number' ? product.newPrice : 0;

  const handleQuickAddNew = () => {
    if (!hasNew) {
      toast.error('المنتج غير متاح بجودة جديد');
      return;
    }

    addToCart(product, 'new', 1);
    toast.success('تمت إضافة قطعة جديدة إلى السلة');
  };

  const handleQuickAddImported = () => {
    if (!hasImported) {
      toast.error('المنتج غير متاح بجودة استيراد');
      return;
    }

    addToCart(product, 'imported', 1);
    toast.success('تمت إضافة قطعة استيراد إلى السلة');
  };

  return (
    <div className="product-card block group h-full flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
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

          <p className="text-xs text-muted-foreground truncate">
            الفئة: {product.category}
          </p>

          <p className="text-xs text-muted-foreground mt-1 truncate">
            الماركات: {formatCarBrands(product.carBrands)}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-2 md:px-3 pb-3 grid grid-cols-[1.85rem_minmax(0,1fr)_3.75rem] md:grid-cols-[2.25rem_minmax(0,1fr)_4rem] items-center gap-x-0.5 md:gap-x-1 gap-y-2">
        <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">جديد</span>
        <span className={`text-[11px] md:text-xs font-bold min-w-0 whitespace-nowrap text-center ${hasNew ? 'text-primary' : 'text-muted-foreground'}`}>
          {hasNew ? `ج.م ${newPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'غير متاح'}
        </span>
        <Button type="button" size="sm" variant="outline" className="h-7 md:h-8 w-[3.75rem] md:w-16 px-1 shrink-0 whitespace-nowrap text-[10px] md:text-xs gap-1" onClick={handleQuickAddNew} disabled={!hasNew}>
          <ShoppingCart className="h-3 w-3 md:h-3.5 md:w-3.5" />
          أضف
        </Button>

        <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">استيراد</span>
        <span className={`text-[10px] md:text-xs font-semibold min-w-0 truncate text-center ${hasImported ? 'text-foreground' : 'text-muted-foreground'}`}>
          {hasImported ? 'متاح' : 'غير متاح'}
        </span>
        {hasImported ? (
          <Button type="button" size="sm" variant="outline" className="h-7 md:h-8 w-[3.75rem] md:w-16 px-1 shrink-0 whitespace-nowrap text-[10px] md:text-xs gap-1" onClick={handleQuickAddImported}>
            <ShoppingCart className="h-3 w-3 md:h-3.5 md:w-3.5" />
            أضف
          </Button>
        ) : (
          <span aria-hidden="true" className="w-[3.75rem] md:w-16" />
        )}
      </div>
    </div>
  );
};
