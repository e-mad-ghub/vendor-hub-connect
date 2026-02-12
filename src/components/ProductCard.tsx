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
    <div className="product-card block group">
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

          <p className="text-xs text-muted-foreground mt-1">
            الماركات: {formatCarBrands(product.carBrands)}
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">جديد</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${hasNew ? 'text-primary' : 'text-muted-foreground'}`}>
              {hasNew ? `ج.م ${newPrice.toFixed(2)}` : 'غير متاح'}
            </span>
            <Button type="button" size="sm" variant="outline" onClick={handleQuickAddNew} disabled={!hasNew}>
              <ShoppingCart className="h-4 w-4 ml-1" />
              أضف
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">استيراد</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${hasImported ? 'text-foreground' : 'text-muted-foreground'}`}>
              {hasImported ? 'متاح' : 'غير متاح'}
            </span>
            {hasImported && (
              <Button type="button" size="sm" variant="outline" onClick={handleQuickAddImported}>
                <ShoppingCart className="h-4 w-4 ml-1" />
                أضف
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
