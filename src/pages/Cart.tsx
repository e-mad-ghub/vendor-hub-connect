import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAvailabilityRequests } from '@/contexts/RequestContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getCartTotal, getItemsByVendor } = useCart();
  const { requests, createRequest, cancelRequest, acceptRequest, declineRequest } = useAvailabilityRequests();
  const [buyerPhone, setBuyerPhone] = React.useState(() => localStorage.getItem('vhc_buyer_phone') || '');
  const vendorGroups = getItemsByVendor();
  const cartSignature = React.useMemo(
    () => items.map(item => `${item.productId}:${item.quantity}`).sort().join('|'),
    [items]
  );
  const matchingRequest = React.useMemo(
    () => requests.find(req => req.cartSignature === cartSignature),
    [requests, cartSignature]
  );
  const subtotal = getCartTotal();
  const quotedSubtotal = matchingRequest?.quotedTotal ?? subtotal;
  const shipping = quotedSubtotal > 50 ? 0 : 5.99;
  const tax = quotedSubtotal * 0.08;
  const total = quotedSubtotal + shipping + tax;
  const quotedTotal = matchingRequest?.quotedTotal ?? subtotal;
  const canCheckout = matchingRequest?.status === 'accepted';
  const lastRequest = requests[0];
  const hasStaleRequest = !matchingRequest && !!lastRequest;

  const handleRequestAvailability = () => {
    if (items.length === 0) return;
    if (!buyerPhone.trim()) {
      toast.error('من فضلك أدخل رقم التليفون للمتابعة');
      return;
    }

    const snapshotItems = vendorGroups.flatMap(group =>
      group.items.map(({ productId, quantity, product }) => ({
        productId,
        quantity,
        title: product.title,
        image: product.images[0],
        price: product.price,
      }))
    );

    const vendorMeta = vendorGroups.length === 1
      ? { vendorId: vendorGroups[0].vendorId, vendorName: vendorGroups[0].vendorName }
      : { vendorName: 'عدة تجار' };

    createRequest({
      items: snapshotItems,
      cartSignature,
      buyerPhone: buyerPhone.trim(),
      ...vendorMeta,
    });
    localStorage.setItem('vhc_buyer_phone', buyerPhone.trim());
    toast.success('تم إرسال طلب التوفر والسعر للتاجر');
  };

  const handleCancelRequest = () => {
    if (!matchingRequest) return;
    cancelRequest(matchingRequest.id, 'تم الإلغاء من العميل');
    toast('تم إلغاء الطلب');
  };

  const handleAcceptQuote = () => {
    if (!matchingRequest) return;
    acceptRequest(matchingRequest.id);
    toast.success('تم تأكيد السعر - تابع للدفع عبر إنستا باي');
    navigate('/checkout');
  };

  const handleDeclineQuote = () => {
    if (!matchingRequest) return;
    declineRequest(matchingRequest.id, 'السعر غير مناسب');
    toast.info('تم رفض السعر. يمكنك طلب عرض جديد بعد التعديل');
  };

  if (items.length === 0) {
    return (
      <Layout>
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
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">عربة التسوق ({items.length} منتج)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {vendorGroups.map((group) => (
              <div key={group.vendorId} className="bg-card rounded-xl shadow-card overflow-hidden">
                {/* Vendor Header */}
                <div className="bg-muted/50 p-3 flex items-center gap-2 border-b border-border">
                  <Store className="h-4 w-4 text-primary" />
                  <Link
                    to={`/vendor/${group.vendorId}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {group.vendorName}
                  </Link>
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                  {group.items.map(({ productId, quantity, product }) => (
                    <div key={productId} className="p-4 flex gap-4">
                      <Link to={`/product/${productId}`}>
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
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
            ))}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-marketplace-success">مجاني</span>
                    ) : (
                      `ج.م ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضريبة التقديرية</span>
                  <span className="font-medium">ج.م {tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary">ج.م {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {quotedSubtotal < 50 && (
                <p className="text-xs text-muted-foreground mt-3">
                  اشتري بـ {(50 - quotedSubtotal).toFixed(2)} ج.م كمان عشان الشحن يبقى مجاني!
                </p>
              )}

              <div className="mt-6 p-4 bg-muted/40 border border-border rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">رقم التليفون للمتابعة</p>
                  <Input
                    type="tel"
                    placeholder="مثال: 01XXXXXXXXX"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">هنستخدم الرقم ده لربط طلبات التوفر والمتابعة لاحقًا.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">تأكيد التوفر والسعر من التاجر</p>
                    <p className="text-xs text-muted-foreground">لازم تبعت طلب وتاخد رد قبل الدفع.</p>
                  </div>
                </div>

                {matchingRequest ? (
                  <>
                    {matchingRequest.status === 'pending' && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>تم إرسال الطلب، في انتظار رد التاجر.</span>
                        <Button size="sm" variant="ghost" onClick={handleCancelRequest}>إلغاء</Button>
                      </div>
                    )}

                    {matchingRequest.status === 'quoted' && (
                      <div className="space-y-3">
                        <p className="text-sm">
                          السعر المرسل: <span className="font-semibold text-primary">ج.م {quotedTotal.toFixed(2)}</span>
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={handleAcceptQuote}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            موافق - تابع للدفع
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={handleDeclineQuote}>
                            غير مناسب
                          </Button>
                        </div>
                      </div>
                    )}

                    {matchingRequest.status === 'accepted' && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>تم قبول السعر، جاهز للدفع عبر إنستا باي.</span>
                      </div>
                    )}

                    {matchingRequest.status === 'unavailable' && (
                      <div className="space-y-2 text-sm text-amber-700">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>التاجر أبلغ أن القطعة غير متاحة.</span>
                        </div>
                        <Button size="sm" className="w-full" onClick={handleRequestAvailability}>
                          طلب تحقق جديد بعد التعديل
                        </Button>
                      </div>
                    )}

                    {(matchingRequest.status === 'cancelled' || matchingRequest.status === 'declined') && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <span>تم إيقاف الطلب. تقدر تبعت طلب جديد بعد تعديل السلة.</span>
                        <Button size="sm" className="w-full" onClick={handleRequestAvailability}>
                          أرسل طلب جديد
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2 text-sm">
                    {hasStaleRequest ? (
                      <p className="text-muted-foreground">السلة اتغيرت بعد آخر طلب. ابعت طلب جديد بالسلة الحالية.</p>
                    ) : (
                      <p className="text-muted-foreground">اضغط لإرسال طلب توفر وسعر للتاجر قبل الدفع.</p>
                    )}
                    <Button size="sm" className="w-full" onClick={handleRequestAvailability}>
                      اطلب التأكيد من التاجر
                    </Button>
                  </div>
                )}
              </div>

              <Button onClick={() => navigate('/checkout')} className="w-full mt-4" size="lg" disabled={!canCheckout}>
                {canCheckout ? 'الدفع عبر إنستا باي' : 'بانتظار تأكيد السعر'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                لازم يقبل التاجر السعر/التوفر قبل الدفع.
              </p>

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
