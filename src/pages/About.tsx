import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';

const About = () => {
  const [faqContent, setFaqContent] = useState('');
  const [shippingInfo, setShippingInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCustomerServiceSettings();
      setFaqContent(data.faqContent);
      setShippingInfo(data.shippingInfo);
    } catch (e: any) {
      setLoadError(e?.message || 'تعذر تحميل بيانات خدمة العملاء.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return (
    <Layout>
      <Seo title="عن سوق الحرفيين" description="تعرف على قصتنا ومميزات سوق الحرفيين." />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">عن سوق الحرفيين</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-4">سوق الحرفيين هو نموذج لمتجر بائع واحد بيعتمد على طلبات عروض سعر عبر واتساب. ده تطبيق تجريبي للعرض فقط.</p>
          <h2 className="text-xl font-semibold mt-6 mb-3">مهمتنا</h2>
          <p className="text-muted-foreground mb-4">نوفر للعميل تجربة تسوق سهلة مع تأكيد يدوي للسعر والتوافر عبر واتساب، وخدمة عملاء سريعة.</p>
          <h2 className="text-xl font-semibold mt-6 mb-3">المزايا</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>متجر بائع واحد بفريق موحد</li>
            <li>طلب عرض سعر سريع عبر واتساب</li>
            <li>تقييمات ومراجعات العملاء</li>
            <li>لوحة إدارة لمتابعة طلبات عروض السعر</li>
          </ul>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <LoadingState title="جاري تحميل البيانات" message="برجاء الانتظار..." />
          ) : loadError ? (
            <InlineError title="تعذر تحميل البيانات" message={loadError} onRetry={loadContent} />
          ) : (
            <div className="prose prose-gray max-w-none text-muted-foreground space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">الأسئلة الشائعة</h2>
                {faqContent.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">معلومات الشحن</h2>
                {shippingInfo.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default About;
