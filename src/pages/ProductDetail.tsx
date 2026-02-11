import React, { useEffect, useMemo, useState } from 'react';
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
import { pushRecentViewedProduct } from '@/lib/customerContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedQualities, setSelectedQualities] = useState<{ new: boolean; imported: boolean }>({ new: false, imported: false });
  const product = getProductById(id || '');
  const relatedProducts = product
    ? getProductsByCategory(product.category).filter(p => p.id !== product?.id).slice(0, 4)
    : [];

  const availability = useMemo(() => {
    return {
      hasNew: !!product?.newAvailable && typeof product?.newPrice === 'number',
      hasImported: !!product?.importedAvailable,
      newPrice: typeof product?.newPrice === 'number' ? product.newPrice : 0,
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    setSelectedQualities({
      new: availability.hasNew,
      imported: availability.hasImported,
    });
  }, [product, availability.hasNew, availability.hasImported]);

  useEffect(() => {
    if (!product?.id) return;
    pushRecentViewedProduct(product.id);
  }, [product?.id]);

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
    if (!selectedQualities.new && !selectedQualities.imported) {
      toast.error('اختار الجودة قبل الإضافة');
      return;
    }
    if (selectedQualities.new) addToCart(product, 'new', quantity);
    if (selectedQualities.imported) addToCart(product, 'imported', quantity);
    toast.success(`تم إضافة ${product.title} للعربة`, {
      description: `الكمية: ${quantity}`,
    });
    trackEvent('Add to Cart', { productId: product.id, quantity, quality: selectedQualities });
  };

  const handleBuyNow = () => {
    if (!selectedQualities.new && !selectedQualities.imported) {
      toast.error('اختار الجودة قبل الإضافة');
      return;
    }
    if (selectedQualities.new) addToCart(product, 'new', quantity);
    if (selectedQualities.imported) addToCart(product, 'imported', quantity);
    toast.success('تمت الإضافة - اطلب عرض سعر عبر واتساب من العربة');
    trackEvent('Request Quote Start', { source: 'product', productId: product.id, quantity, quality: selectedQualities });
    navigate('/cart');
  };

  return (
    <Layout>
      <Seo title={product.title} description={product.description} />
      <div className="container py-3 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/category/${product.category}`} className="hover:text-primary">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-10">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg md:rounded-xl flex items-center justify-center text-sm text-muted-foreground overflow-hidden">
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
          <div className="space-y-3 md:space-y-4">
            {/* Title */}
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-lg md:rounded-xl p-3 md:p-4">
              <div className="space-y-2 text-sm">
                <p>
                  جديد: {availability.hasNew ? `ج.م ${availability.newPrice.toFixed(2)}` : 'غير متاح'}
                </p>
                <p>
                  استيراد: {availability.hasImported ? 'متاح' : 'غير متاح'}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg md:rounded-xl p-3 md:p-4 border border-border text-sm text-muted-foreground">
              <p>الفئة: {product.category}</p>
              <p>الماركات: {formatCarBrands(product.carBrands)}</p>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <p className="font-medium">اختر الجودة:</p>
              <div className="flex flex-wrap gap-3">
                {availability.hasNew && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedQualities.new}
                      onChange={(e) => setSelectedQualities((prev) => ({ ...prev, new: e.target.checked }))}
                    />
                    جديد
                  </label>
                )}
                {availability.hasNew && availability.hasImported && (
                  <span className="text-xs text-muted-foreground">أو</span>
                )}
                {availability.hasImported && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedQualities.imported}
                      onChange={(e) => setSelectedQualities((prev) => ({ ...prev, imported: e.target.checked }))}
                    />
                    استيراد
                  </label>
                )}
                {!availability.hasNew && !availability.hasImported && (
                  <span className="text-sm text-muted-foreground">غير متاح حاليًا</span>
                )}
              </div>
              {(selectedQualities.new && selectedQualities.imported) && (
                <p className="text-xs text-muted-foreground">
                  دلوقتي حضرتك طلبت فحص الجديد والاستيراد مع بعض عشان مقارنة السعر، وبعد التأكيد تقدر تختار واحد بس اللي يناسبك.
                </p>
              )}
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleBuyNow} size="lg" className="flex-1" disabled={!selectedQualities.new && !selectedQualities.imported}>
                أضف واطلب عرض سعر
              </Button>
              <Button onClick={handleAddToCart} size="lg" variant="outline" className="flex-1" disabled={!selectedQualities.new && !selectedQualities.imported}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                أضف للعربة
              </Button>
              <Button size="lg" variant="outline" className="px-3 w-full sm:w-auto">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-3 w-full sm:w-auto">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-border">
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

        <div className="mt-6 md:mt-8 bg-card rounded-lg md:rounded-xl p-4 md:p-6 shadow-card">
          <h3 className="font-semibold mb-3">وصف المنتج</h3>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8 md:mt-10">
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
            <p className="text-sm text-muted-foreground">
              جودة: {selectedQualities.new && selectedQualities.imported ? 'جديد + استيراد' : selectedQualities.new ? 'جديد' : selectedQualities.imported ? 'استيراد' : 'غير محدد'}
            </p>
            <p className="text-xl font-bold text-primary">
              {availability.hasNew && selectedQualities.new
                ? `ج.م ${availability.newPrice.toFixed(2)}`
                : 'سعر حسب العرض'}
            </p>
          </div>
          <Button onClick={handleAddToCart} size="sm" variant="outline" disabled={!selectedQualities.new && !selectedQualities.imported}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button onClick={handleBuyNow} size="sm" className="px-6" disabled={!selectedQualities.new && !selectedQualities.imported}>
            اطلب عرض سعر
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
