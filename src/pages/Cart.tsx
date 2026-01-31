import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { Seo } from '@/components/Seo';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getCartTotal, getDetailedItems } = useCart();
  const detailedItems = getDetailedItems();
  const subtotal = getCartTotal();

  if (items.length === 0) {
    return (
      <Layout>
        <Seo title="عربة التسوق" description="عربتك فاضية الآن. أضف المنتجات واطلب عرض سعر." />
        <div className="container py-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">العربة فاضية</h1>
          <p className="text-muted-foreground mb-6">زود منتجات وابدأ التسوق!</p>
          <Link to="/search">
            <Button>
              كمل تسوق
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="عربة التسوق" description="راجع منتجاتك واطلب عرض سعر عبر واتساب." />
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">عربة التسوق ({items.length} منتج)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {detailedItems.map(({ productId, quantity, product }) => (
                  <div key={productId} className="p-4 flex gap-4">
                    <Link to={`/product/${productId}`} className="w-20 h-20 md:w-24 md:h-24">
                      <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                        {product.imageDataUrl ? (
                          <img src={product.imageDataUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          'صورة'
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${productId}`}>
                        <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary mt-1">ج.م {product.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(productId)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الإجمالي الفرعي</span>
                  <span className="font-medium">ج.م {subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs text-muted-foreground">
                    السعر النهائي والتوافر بيتأكدوا يدويًا بعد إرسال طلب عرض السعر عبر واتساب.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/40 border border-border rounded-lg flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">اطلب عرض سعر عبر واتساب</p>
                  <p className="text-xs text-muted-foreground">
                    فريقنا هيأكد الأسعار والتوافر ويرد عليك مباشرة.
                  </p>
                </div>
              </div>

              <Button onClick={() => navigate('/checkout')} className="w-full mt-4" size="lg">
                طلب عرض سعر عبر واتساب
              </Button>

              <Link to="/search">
                <Button variant="ghost" className="w-full mt-2">
                  كمل تسوق
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
