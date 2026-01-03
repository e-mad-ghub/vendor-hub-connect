import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RatingStars } from '@/components/RatingStars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getVendorById, getReviewsByProduct, getProductsByVendor } from '@/data/mockData';
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, Minus, Plus, Store, ChevronRight, ThumbsUp } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(id || '');
  const vendor = product ? getVendorById(product.vendorId) : null;
  const reviews = product ? getReviewsByProduct(product.id) : [];
  const vendorProducts = vendor ? getProductsByVendor(vendor.id).filter(p => p.id !== product?.id).slice(0, 4) : [];

  if (!product) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
          <Link to="/">
            <Button>رجوع للرئيسية</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`تم إضافة ${product.title} للعربة`, {
      description: `الكمية: ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    toast.success('تمت الإضافة - اطلب التوفر والسعر من العربة قبل الدفع');
    navigate('/cart');
  };

  return (
    <Layout>
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
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <div className="flex items-center gap-4">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
                <span className="text-sm text-muted-foreground">{product.sold.toLocaleString()} مبيعات</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">ج.م {product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">ج.م {product.originalPrice.toFixed(2)}</span>
                    <Badge className="deal-badge text-primary-foreground">-{discount}% خصم</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Vendor */}
            {vendor && (
              <Link
                to={`/vendor/${vendor.id}`}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <img src={vendor.logo} alt={vendor.storeName} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    {vendor.storeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {vendor.rating} • {vendor.totalOrders} طلب
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}

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
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stock} متاح</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                أضف واطلب التوفر
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
                <p className="text-xs text-muted-foreground">شحن مجاني</p>
              </div>
              <div className="text-center p-3">
                <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">دفع آمن</p>
              </div>
              <div className="text-center p-3">
                <RefreshCw className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">استرجاع خلال ٣٠ يوم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">الوصف</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h3 className="font-semibold mb-3">وصف المنتج</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              
              {product.tags && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">كلمات دلالية</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="bg-card rounded-xl p-6 shadow-card">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {review.customerName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.customerName}</span>
                            <RatingStars rating={review.rating} showCount={false} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.createdAt}</p>
                          <p className="text-foreground">{review.comment}</p>
                          <button className="flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-primary">
                            <ThumbsUp className="h-4 w-4" />
                            مفيد ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">لسه مافيش تقييمات</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* More from Vendor */}
        {vendorProducts.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">المزيد من {vendor?.storeName}</h3>
              <Link to={`/vendor/${vendor?.id}`}>
                <Button variant="ghost" size="sm" className="text-primary">
                  زور المتجر <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vendorProducts.map((p) => (
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
            اطلب التوفر
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
