import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api, type CustomerServiceSettings } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';
import { getErrorMessage } from '@/lib/error';
import { splitParagraphs } from '@/lib/utils';

const About = () => {
  const [settings, setSettings] = useState<CustomerServiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCustomerServiceSettings();
      setSettings(data);
    } catch (e: unknown) {
      setLoadError(getErrorMessage(e, 'تعذر تحميل بيانات الصفحة.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const paragraphs = splitParagraphs(settings?.aboutContent || '');

  return (
    <Layout>
      <Seo title="عن سوق الحرفيين" description="تعرف على سوق الحرفيين وطريقة عمل الموقع وخدمة العملاء." />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">عن سوق الحرفيين</h1>
        {isLoading ? (
          <LoadingState title="جاري تحميل الصفحة" message="برجاء الانتظار..." />
        ) : loadError ? (
          <InlineError title="تعذر تحميل الصفحة" message={loadError} onRetry={loadSettings} />
        ) : (
          <div className="space-y-8">
            <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold mb-2">طريقة العمل</h2>
                <p className="text-sm text-muted-foreground">
                  نعرض المنتجات المتاحة مبدئيًا ثم نراجع التوافق والتوفر قبل التأكيد النهائي.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold mb-2">التواصل</h2>
                <p className="text-sm text-muted-foreground">
                  فريق خدمة العملاء متاح للرد على الأسئلة وتأكيد التفاصيل قبل إتمام الطلب.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold mb-2">الشفافية</h2>
                <p className="text-sm text-muted-foreground">
                  نوضح جودة القطعة المتاحة ومعلومات الشحن والاسترجاع وسياسات الموقع بشكل مباشر.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default About;
