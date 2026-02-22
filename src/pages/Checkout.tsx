import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import type { WhatsAppSettings } from '@/types/marketplace';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { formatCarBrands } from '@/lib/brands';
import { getErrorMessage } from '@/lib/error';

const Checkout = () => {
  const { items, getDetailedItems, clearCart } = useCart();
  const detailedItems = getDetailedItems();
  const hasUnpricedItems = detailedItems.some((item) => item.quality === 'imported');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const data = await api.getWhatsAppSettings();
      setSettings(data);
    } catch (e: unknown) {
      setSettings(null);
      setSettingsError(getErrorMessage(e, 'تعذر تحميل إعدادات واتساب.'));
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const itemsText = useMemo(() => {
    return detailedItems
      .map(({ product, quantity, quality, unitPrice }) => {
        const qualityLabel = quality === 'new' ? 'جديد' : 'استيراد';
        const priceLabel = quality === 'new' ? `ج.م ${unitPrice.toFixed(2)}` : 'السعر بيتحدد بعد الطلب';
        const brands = formatCarBrands(product.carBrands);
        return [
          `• ${product.title}`,
          `  - الجودة: ${qualityLabel}`,
          `  - الكمية: ${quantity}`,
          `  - السعر: ${priceLabel}`,
          `  - الماركات/الموديلات: ${brands}`,
        ].join('\n');
      })
      .join('\n');
  }, [detailedItems]);

  const buildMessage = () => {
    const header = [
      'تفاصيل الطلب:',
      itemsText,
    ].join('\n');

    return header.trim();
  };

  if (items.length === 0) {
    return (
      <Layout>
        <Seo title="إتمام الطلب" description="عربتك فاضية الآن." />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">العربة فاضية</h1>
          <Link to="/search">
            <Button>كمل تسوق</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (settingsLoading) {
    return (
      <Layout>
        <Seo title={hasUnpricedItems ? 'طلب عرض سعر' : 'إتمام الطلب'} description="جاري تحميل إعدادات واتساب." />
        <div className="container py-12 max-w-5xl">
          <LoadingState title="جاري تحميل إعدادات واتساب" message="برجاء الانتظار..." />
        </div>
      </Layout>
    );
  }

  if (settingsError) {
    return (
      <Layout>
        <Seo title={hasUnpricedItems ? 'طلب عرض سعر' : 'إتمام الطلب'} description="تعذر تحميل إعدادات واتساب." />
        <div className="container py-12 max-w-5xl">
          <InlineError
            title="تعذر تحميل الإعدادات"
            message={settingsError}
            onRetry={loadSettings}
          />
        </div>
      </Layout>
    );
  }

  const handleRequestQuote = async () => {
    if (isSubmitting) return;

    const phoneNumber = (settings?.phoneNumber || '').replace(/\D/g, '');
    if (!phoneNumber) {
      toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
      return;
    }

    setIsSubmitting(true);
    const message = buildMessage();

    try {
  const items = detailedItems.map(({ product, quantity, quality, unitPrice }) => ({
    productId: product.id,
    title: product.title,
    quantity,
    quality,
    unitPrice,
    image: '',
  }));

      await api.createQuoteRequest({
        customerName: 'عميل بدون اسم',
        customerPhone: 'غير محدد',
        message,
        items,
      });

      trackEvent('Request Quote Submit', { source: 'checkout', itemsCount: items.length });
      const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.location.href = waUrl;
      clearCart();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'تعذر إرسال طلب عرض السعر'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Seo
        title={hasUnpricedItems ? 'طلب عرض سعر' : 'إتمام الطلب'}
        description={hasUnpricedItems
          ? 'أرسل طلبك عبر واتساب لتأكيد السعر والتوافر.'
          : 'أرسل طلبك مباشرة عبر واتساب.'}
      />
      <div className="container py-3 md:py-8 max-w-5xl">
        <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
          {hasUnpricedItems ? 'طلب عرض سعر عبر واتساب' : 'إتمام الطلب عبر واتساب'}
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-muted/40 border border-border rounded-lg md:rounded-xl p-3 md:p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">مراجعة يدوية بواسطة فريق الخبراء</p>
                <p className="text-xs text-muted-foreground">
                  كل منتج بيتم التأكد منه يدويًا بواسطة فريق الخبراء قبل التواصل معك للرد.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">محتوى الرسالة</h2>
              <pre className="text-sm whitespace-pre-wrap text-muted-foreground bg-muted/50 rounded-lg p-4">
                {buildMessage()}
              </pre>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold mb-4">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs text-muted-foreground mb-2">الجودات المختارة</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {detailedItems.map(({ product, quantity, quality, unitPrice }) => (
                      <div key={`${product.id}-${quality}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {product.title} ({quality === 'new' ? 'جديد' : 'استيراد'}) × {quantity}
                        </span>
                        <span className="whitespace-nowrap">
                          {quality === 'new' ? `ج.م ${unitPrice.toFixed(2)}` : 'السعر بيتحدد بعد الطلب'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleRequestQuote} className="w-full mt-4" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'جاري التحويل...' : (hasUnpricedItems ? 'طلب عرض سعر عبر واتساب' : 'اطلب الآن على واتساب')}
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
