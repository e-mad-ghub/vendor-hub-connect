import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAvailabilityRequests } from '@/contexts/RequestContext';
import { validatePhone } from '@/lib/validation';
import { toast } from 'sonner';
import { CreditCard, Truck, ShieldCheck, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, getItemsByVendor, clearCart } = useCart();
  const { requests } = useAvailabilityRequests();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('instapay');
  const [instapayHandle, setInstapayHandle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const vendorGroups = getItemsByVendor();
  const subtotal = getCartTotal();
  const cartSignature = React.useMemo(
    () => items.map(item => `${item.productId}:${item.quantity}`).sort().join('|'),
    [items]
  );
  const matchingRequest = React.useMemo(
    () => requests.find(r => r.cartSignature === cartSignature),
    [requests, cartSignature]
  );
  const pricedSubtotal = matchingRequest?.quotedTotal ?? subtotal;
  const shipping = pricedSubtotal > 50 ? 0 : 5.99;
  const tax = pricedSubtotal * 0.08;
  const total = pricedSubtotal + shipping + tax;

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'مصر',
  });

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
    setShippingInfo({ ...shippingInfo, phone: digitsOnly });
    setPhoneError(null);
  };

  const validateShippingStep = (): boolean => {
    if (shippingInfo.phone) {
      const validation = validatePhone(shippingInfo.phone);
      if (!validation.valid) {
        setPhoneError(validation.error || 'رقم غير صالح');
        return false;
      }
    }
    return true;
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">العربة فاضية</h1>
          <Link to="/search">
            <Button>كمل تسوق</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOrderPlaced(true);
    clearCart();
    toast.success('تم تأكيد طلبك بنجاح!');
    setIsProcessing(false);
  };

  if (!orderPlaced && (!matchingRequest || matchingRequest.status !== 'accepted')) {
    let message = 'لازم تبعت طلب توفر وسعر وتاخد رد بالموافقة قبل الدفع.';
    if (matchingRequest?.status === 'pending') {
      message = 'طلبك في انتظار رد التاجر على التوفر والسعر.';
    } else if (matchingRequest?.status === 'quoted') {
      message = 'راجع السعر اللي أرسله التاجر في صفحة العربة، وقبله أو ارفضه.';
    } else if (matchingRequest?.status === 'unavailable') {
      message = 'التاجر بلغ إن القطعة مش متاحة حالياً. عدل السلة أو اطلب بديل.';
    } else if (matchingRequest?.status === 'cancelled' || matchingRequest?.status === 'declined') {
      message = 'الطلب متوقف. ابعت طلب جديد من صفحة العربة بعد التعديل.';
    }

    return (
      <Layout>
        <div className="container py-12 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <AlertTriangle className="h-12 w-12 mx-auto text-primary mb-3" />
            <h1 className="text-xl font-bold mb-2">محتاج موافقة التاجر قبل الدفع</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Link to="/cart">
              <Button>الرجوع لعربة التسوق</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container py-12 text-center max-w-lg mx-auto">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <CheckCircle className="h-16 w-16 mx-auto text-marketplace-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">تم تأكيد الطلب!</h1>
            <p className="text-muted-foreground mb-6">
              شكرًا لطلبك. هيوصلك إيميل تأكيد قريب.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Order #ORD-{Date.now().toString().slice(-8)}
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/account">
                <Button className="w-full">شوف طلباتك</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">كمل تسوق</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">الدفع</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['الشحن', 'الدفع', 'المراجعة'].map((label, idx) => (
            <React.Fragment key={label}>
              <div
                className={`flex items-center gap-2 ${
                  step > idx + 1 ? 'text-primary' : step === idx + 1 ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > idx + 1
                      ? 'bg-primary text-primary-foreground'
                      : step === idx + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                <span className="hidden sm:inline font-medium">{label}</span>
              </div>
              {idx < 2 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">بيانات الشحن</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="fullName">الاسم بالكامل</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      placeholder="محمد أحمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">الإيميل</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">التليفون</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className={phoneError ? 'border-destructive' : ''}
                    />
                    {phoneError && (
                      <p className="text-xs text-destructive mt-1">{phoneError}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">عنوان الشارع</Label>
                    <Input
                      id="street"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                      placeholder="١٢٣ شارع رئيسي"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="القاهرة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">المحافظة</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      placeholder="الجيزة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">الرمز البريدي</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      placeholder="XXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">الدولة</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      placeholder="مصر"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (validateShippingStep()) {
                      setStep(2);
                    }
                  }} 
                  className="w-full mt-6"
                >
                  اكمل للدفع
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">الدفع عبر إنستا باي</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  الدفع متاح عبر إنستا باي فقط بعد موافقة التاجر على السعر.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instapay">هاندل إنستا باي</Label>
                    <Input
                      id="instapay"
                      placeholder="مثال: yourname@bank"
                      value={instapayHandle}
                      onChange={(e) => setInstapayHandle(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">لن يتم تنفيذ دفعة حقيقية - ده نموذج تجريبي.</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  تفاصيل الدفع هنا للعرض فقط.
                </p>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    رجوع
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={!instapayHandle}>
                    مراجعة الطلب
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <h2 className="text-lg font-semibold mb-6">راجع طلبك</h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">الشحن إلى:</p>
                      <p className="text-sm text-muted-foreground">
                        {shippingInfo.fullName}<br />
                        {shippingInfo.street}<br />
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      تعديل
                    </Button>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-start justify-between">
                  <div>
                    <p className="font-medium">طريقة الدفع</p>
                    <p className="text-sm text-muted-foreground">إنستا باي • {instapayHandle || 'لم يتم إدخال الهاندل'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                    تعديل
                  </Button>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {vendorGroups.map((group) => (
                    <div key={group.vendorId}>
                      <p className="text-sm font-medium mb-2">من {group.vendorName}:</p>
                      {group.items.map(({ productId, quantity, product }) => (
                        <div key={productId} className="flex gap-3 py-2">
                          <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground">الكمية: {quantity}</p>
                          </div>
                          <p className="font-medium">ج.م {(product.price * quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    رجوع
                  </Button>
                  <Button onClick={handlePlaceOrder} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">ملخص الطلب</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي المنتجات ({items.length} منتج)</span>
                  <span className="font-medium">ج.م {pricedSubtotal.toFixed(2)}</span>
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
                  <span className="text-muted-foreground">الضريبة</span>
                  <span className="font-medium">ج.م {tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary">ج.م {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {matchingRequest?.quotedTotal && (
                <p className="text-xs text-muted-foreground mt-3">
                  السعر المعروض مبني على عرض السعر الأخير المعتمد من التاجر.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
