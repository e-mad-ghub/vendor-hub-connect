import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { categories } from '@/data/mockData';
import { useProducts } from '@/data/productsStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { sanitizePhoneInput, validatePhone } from '@/lib/validation';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';

const Index = () => {
  const { products } = useProducts();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [customCarBrand, setCustomCarBrand] = useState('');
  const [isSending, setIsSending] = useState(false);
  const featuredProducts = products.slice(0, 8);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const features = [
    { icon: Truck, title: 'شحن مرن', desc: 'ننسق معاك بعد تأكيد العرض' },
    { icon: Shield, title: 'طلبات موثوقة', desc: 'تأكيد يدوي للأسعار والتوافر' },
    { icon: RefreshCw, title: 'تعديلات سهلة', desc: 'عدّل السلة واطلب عرض جديد' },
    { icon: Headphones, title: 'دعم سريع', desc: 'نتواصل معاك عبر واتساب' },
  ];

  const buildCustomMessage = () => {
    const partLine = customCarBrand.trim()
      ? `${customPartName.trim()} (${customCarBrand.trim()})`
      : customPartName.trim();
    return [
      'طلب عرض سعر (طلب مخصص)',
      `الاسم: ${customerName.trim()}`,
      `رقم التليفون: ${customerPhone.trim()}`,
      '',
      'تفاصيل الطلب:',
      `• القطعة: ${partLine}`,
      `  - الماركات/الموديلات: ${customCarBrand.trim() || 'غير محدد'}`,
      '',
      'ملاحظة: من فضلك أكد السعر والتوفر. شكرًا.',
    ].join('\n');
  };

  const handleCustomRequest = async () => {
    if (isSending) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('من فضلك اكتب الاسم ورقم التليفون');
      return;
    }
    const phoneValidation = validatePhone(customerPhone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'رقم التليفون غير صالح');
      return;
    }
    if (!customPartName.trim()) {
      toast.error('من فضلك اكتب اسم القطعة');
      return;
    }
    setIsSending(true);
    try {
      const settings = await api.getWhatsAppSettings();
      const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
      if (!phoneDigits) {
        toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
        return;
      }
      const message = buildCustomMessage();
      await api.createQuoteRequest({
        customerName: customerName.trim(),
        customerPhone: phoneValidation.sanitized || customerPhone.trim(),
        message,
        items: [
          {
            productId: `custom_${Date.now()}`,
            title: customCarBrand.trim()
              ? `${customPartName.trim()} (${customCarBrand.trim()})`
              : customPartName.trim(),
            quantity: 1,
            unitPrice: 0,
            image: '',
          },
        ],
      });
      trackEvent('Request Quote Submit', { source: 'custom', hasBrand: !!customCarBrand.trim() });
      window.location.href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    } catch (e: any) {
      toast.error(e.message || 'تعذر إرسال الطلب');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <Seo
        title="الرئيسية"
        description="مع فريقنا المختص هتقدر توصل لأي قطعه غيار بتدور عليها في مصر سواء جديدة او استيراد ف ثواني من موبايلك و كمان توصلك لحد عربيتك"
      />
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary mb-4">🔥 عروض سخنة</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                دور على قطع غيار عربيتك{' '}
                <span className="text-primary">وهنوصلهالك بسرعة</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
                منتجات مختارة من فريق واحد موثوق. اطلب عرض سعر وتأكد من التوافر بسرعة عبر واتساب.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/search">
                  <Button size="lg" className="w-full sm:w-auto">
                    ابدأ التسوق
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-6 bg-card rounded-xl p-4 shadow-card max-w-md mx-auto md:mx-0">
                <h3 className="font-semibold mb-2">عايز قطعة مش موجودة؟</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  ابعت طلب سريع باسم القطعة والماركة المطلوبة.
                </p>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="custom-name">اسمك</Label>
                    <Input
                      id="custom-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: أحمد محمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-phone">رقم التليفون</Label>
                    <Input
                      id="custom-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                      placeholder="مثال: 01XXXXXXXXX"
                      inputMode="tel"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-part">اسم القطعة</Label>
                    <Input
                      id="custom-part"
                      value={customPartName}
                      onChange={(e) => setCustomPartName(e.target.value)}
                      placeholder="مثال: طلمبة بنزين"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-brand">ماركة العربية</Label>
                    <Input
                      id="custom-brand"
                      value={customCarBrand}
                      onChange={(e) => setCustomCarBrand(e.target.value)}
                      placeholder="مثال: هيونداي"
                    />
                  </div>
                  <Button onClick={handleCustomRequest} disabled={isSending}>
                    {isSending ? 'جاري الإرسال...' : 'اطلب عرض سعر'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDBAELcCBZvFeMrydahzOwchiBAohWXYTgmA&s"
                alt="ميكانيكي بيصلح عربية داخل ورشة"
                className="rounded-xl shadow-card-hover object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="container mt-6">
        <CategoryChips categories={categories} />
      </section>

      {/* Features */}
      <section className="container my-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">منتجات مختارة</h3>
            <p className="text-sm text-muted-foreground">متختارة مخصوص ليك</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" size="sm" className="text-primary">
              شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">وصلت جديد</h3>
            <p className="text-sm text-muted-foreground">أحدث منتجات تجارنا</p>
          </div>
          <Link to="/search?sort=newest">
            <Button variant="ghost" size="sm" className="text-primary">
              شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container my-10">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">جاهز تطلب عرض سعر؟</h3>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            المنصة دلوقتي شغالة كبائع واحد. أضف منتجاتك للسلة واطلب عرض سعر عبر واتساب لتأكيد السعر والتوافر.
          </p>
          <p className="text-sm opacity-90">
            التواصل والمتابعة بيتموا يدويًا عبر واتساب.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
