import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import type { WhatsAppSettings } from '@/types/marketplace';

const DEFAULT_TEMPLATE =
  'Hello, my name is [Customer Name]. I would like a quote for the following items:\n[Items]\nPlease confirm price and availability. Thank you.';

const Checkout = () => {
  const { items, getCartTotal, getDetailedItems, clearCart } = useCart();
  const detailedItems = getDetailedItems();
  const subtotal = getCartTotal();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getWhatsAppSettings()
      .then((data) => {
        if (isMounted) setSettings(data);
      })
      .catch(() => {
        if (isMounted) setSettings(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const itemsText = useMemo(() => {
    return detailedItems
      .map(({ product, quantity }) => `- ${product.title} x ${quantity}`)
      .join('\n');
  }, [detailedItems]);

  const buildMessage = () => {
    const template = settings?.messageTemplate || DEFAULT_TEMPLATE;
    let message = template
      .replace(/\[Customer Name\]/g, customerName.trim())
      .replace(/\[Customer Phone\]/g, customerPhone.trim())
      .replace(/\[Items\]/g, itemsText);

    if (!template.includes('[Items]')) {
      message = `${message}\n${itemsText}`;
    }
    if (!template.includes('[Customer Phone]')) {
      message = `${message}\nPhone: ${customerPhone.trim()}`;
    }

    return message.trim();
  };

  if (items.length === 0) {
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

  const handleRequestQuote = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('من فضلك اكتب الاسم ورقم التليفون');
      return;
    }

    const phoneNumber = (settings?.phoneNumber || '').replace(/\D/g, '');
    if (!phoneNumber) {
      toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
      return;
    }

    setIsSubmitting(true);
    const message = buildMessage();

    try {
      await api.createQuoteRequest({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        message,
        items: detailedItems.map(({ product, quantity }) => ({
          productId: product.id,
          title: product.title,
          quantity,
          price: product.price,
          image: product.images[0],
        })),
      });

      const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = waUrl;
      clearCart();
    } catch (e: any) {
      toast.error(e.message || 'تعذر إرسال طلب عرض السعر');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-4 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">طلب عرض سعر عبر واتساب</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">بيانات التواصل</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="customerName">الاسم بالكامل</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="محمد أحمد"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerPhone">رقم التليفون</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">تأكيد يدوي للأسعار والتوافر</p>
                <p className="text-xs text-muted-foreground">
                  الأسعار والتوافر بيتأكدوا يدويًا عبر واتساب بعد إرسال طلب عرض السعر.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4">محتوى الرسالة</h2>
              <pre className="text-sm whitespace-pre-wrap text-muted-foreground bg-muted/50 rounded-lg p-4">
                {buildMessage()}
              </pre>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد المنتجات</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الإجمالي الفرعي</span>
                  <span className="font-medium">ج.م {subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs text-muted-foreground">
                    ده إجمالي تقريبي. السعر النهائي بيتأكد عبر واتساب.
                  </p>
                </div>
              </div>

              <Button onClick={handleRequestQuote} className="w-full mt-4" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'جاري التحويل...' : 'طلب عرض سعر عبر واتساب'}
              </Button>
              <Link to="/cart">
                <Button variant="ghost" className="w-full mt-2">
                  رجوع للعربة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
