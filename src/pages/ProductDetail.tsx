import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getProductsByCategory } from '@/data/productsStore';
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, Minus, Plus, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { toast } from 'sonner';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { formatCarBrands } from '@/lib/brands';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = getProductById(id || '');
  const relatedProducts = product
    ? getProductsByCategory(product.category).filter(p => p.id !== product?.id).slice(0, 4)
    : [];

  if (!product) {
    return (
      <Layout>
        <Seo title="منتج غير موجود" description="المنتج المطلوب غير متاح حاليًا." />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
          <Link to="/">
            <Button>رجوع للرئيسية</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`تم إضافة ${product.title} للعربة`, {
      description: `الكمية: ${quantity}`,
    });
    trackEvent('Add to Cart', { productId: product.id, quantity });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    toast.success('تمت الإضافة - اطلب عرض سعر عبر واتساب من العربة');
    trackEvent('Request Quote Start', { source: 'product', productId: product.id, quantity });
    navigate('/cart');
  };

  return (
    <Layout>
      <Seo title={product.title} description={product.description} />
      <div className="container py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/category/${product.category}`} className="hover:text-primary">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground overflow-hidden">
              {product.imageDataUrl ? (
                <img
                  src={product.imageDataUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  decoding="async"
                  fetchpriority="high"
                />
              ) : (
                'صورة المنتج'
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">ج.م {product.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border text-sm text-muted-foreground">
              <p>الفئة: {product.category}</p>
              <p>الماركات: {formatCarBrands(product.carBrands)}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium">الكمية:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                أضف واطلب عرض سعر
              </Button>
              <Button onClick={handleAddToCart} size="lg" variant="outline" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                أضف للعربة
              </Button>
              <Button size="lg" variant="outline" className="px-3">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-3">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <div className="text-center p-3">
                <Truck className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">شحن بعد التأكيد</p>
              </div>
              <div className="text-center p-3">
                <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">تأكيد يدوي</p>
              </div>
              <div className="text-center p-3">
                <RefreshCw className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">استرجاع خلال ٣٠ يوم</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-card rounded-xl p-6 shadow-card">
          <h3 className="font-semibold mb-3">وصف المنتج</h3>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">منتجات مشابهة</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Add to Cart - Mobile */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3 md:hidden sticky-bar z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xl font-bold text-primary">ج.م {product.price.toFixed(2)}</p>
          </div>
          <Button onClick={handleAddToCart} size="sm" variant="outline">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button onClick={handleBuyNow} size="sm" className="px-6">
            اطلب عرض سعر
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
